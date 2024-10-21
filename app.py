from contextlib import asynccontextmanager
from typing import Optional
import os
import zipfile
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, APIRouter, status, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field
import subprocess
from fastapi.templating import Jinja2Templates

from modules.comfyui_flux_service import (
    generate,
    get_queue_status,
    check_health
)
from config import COMFYUI_DIR, OUTPUT_DIR, TEMP_DIR, STATIC_DIR, TEMPLATES_DIR


# UTILS
def read_images(request: Request):
    images = [
        img for img in os.listdir(OUTPUT_DIR) if img.endswith(".png")
    ]
    return images


# Schemas
class GenerateSchema(BaseModel):
    prompt: str
    width: Optional[int] = Field(default=None)
    height: Optional[int] = Field(default=None)
    batch_size: Optional[int] = Field(default=None, ge=1, le=20)
    noise_seed: Optional[int] = Field(default=None)
    steps: Optional[int] = Field(default=None, ge=1, le=30)


class QueueSchema(BaseModel):
    queue_pending: int
    queue_running: int


class ImageSchema(BaseModel):
    image_name: str


class ImagesSchema(BaseModel):
    images: list[str]


# APP
@asynccontextmanager
async def lifespan(app: FastAPI):
    if not COMFYUI_DIR.exists():
        raise FileNotFoundError("ComfyUI not found")
    subprocess.Popen(["python", (COMFYUI_DIR / "main.py")])
    yield
    subprocess.Popen(["pkill", "-f", (COMFYUI_DIR / "main.py")])


app = FastAPI(lifespan=lifespan)
templates = Jinja2Templates(directory=TEMPLATES_DIR)
app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
schnell_router = APIRouter(prefix="/schnell", tags=["schnell"])
dev_router = APIRouter(prefix="/dev", tags=["dev"])
views_router = APIRouter(
    tags=["views"],
    include_in_schema=False
)


@app.get("/health")
async def health():
    if not await check_health():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ComfyUI is not healthy"
        )
    return {"status": "ok"}


@views_router.get("/", response_class=HTMLResponse)
async def images_view(request: Request):
    try:
        images = read_images(request)
        return templates.TemplateResponse(
            "images.html",
            {"request": request, "images": images}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/images", response_model=ImagesSchema)
async def get_images(request: Request):
    try:
        return ImagesSchema(images=read_images(request))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/images/{image_name}")
async def get_image(image_name: str):
    image_path = os.path.join(OUTPUT_DIR, image_name)
    if os.path.exists(image_path):
        return FileResponse(image_path)
    raise HTTPException(status_code=404, detail="Image not found")


@dev_router.post("/generate", status_code=status.HTTP_204_NO_CONTENT)
async def dev_generate(to_generate: GenerateSchema):
    try:
        await generate("dev", **to_generate.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@dev_router.post("/generate/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def dev_generate_bulk(to_generate: list[GenerateSchema]):
    try:
        for generate_schema in to_generate:
            await generate(
                "dev",
                **generate_schema.model_dump(exclude_none=True)
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@schnell_router.post("/generate", status_code=status.HTTP_204_NO_CONTENT)
async def schnell_generate(to_generate: GenerateSchema):
    try:
        await generate("schnell", **to_generate.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@schnell_router.post("/generate/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def schnell_generate_bulk(to_generate: list[GenerateSchema]):
    try:
        for generate_schema in to_generate:
            await generate(
                "schnell",
                **generate_schema.model_dump(exclude_none=True)
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.get("/queue", response_model=QueueSchema)
async def queue():
    queue_status = await get_queue_status()
    return QueueSchema(
        queue_pending=len(queue_status["queue_pending"]),
        queue_running=len(queue_status["queue_running"])
    )


@app.get("/download_files")
async def download_files():
    zip_filename = TEMP_DIR / f"output_{uuid4()}.zip"

    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        for root, dirs, files in os.walk(OUTPUT_DIR):
            for file in files:
                file_path = Path(root) / file
                zipf.write(file_path, file_path.relative_to(OUTPUT_DIR))

    return FileResponse(
        zip_filename,
        filename=zip_filename.name,
        media_type="application/zip"
    )


@app.get("/delete_files")
async def delete_files():
    try:
        for file in os.listdir(OUTPUT_DIR):
            os.remove(os.path.join(OUTPUT_DIR, file))
        for file in os.listdir(TEMP_DIR):
            os.remove(os.path.join(TEMP_DIR, file))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


app.include_router(views_router)
app.include_router(schnell_router)
app.include_router(dev_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="localhost", port=8000, reload=True)
