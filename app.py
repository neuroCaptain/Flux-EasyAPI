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
from modules.logger import logger
from config import (
    COMFYUI_DIR,
    OUTPUT_DIR,
    TEMP_DIR,
    STATIC_DIR,
    TEMPLATES_DIR,
    Models,
)


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
        logger.error("ComfyUI not found")
        raise FileNotFoundError("ComfyUI not found")
    logger.info("Starting ComfyUI...")
    subprocess.Popen(["python", (COMFYUI_DIR / "main.py")])
    logger.info("ComfyUI started")
    yield
    logger.info("Stopping ComfyUI...")
    subprocess.Popen(["pkill", "-f", (COMFYUI_DIR / "main.py")])
    logger.info("ComfyUI stopped")


app = FastAPI(lifespan=lifespan)
templates = Jinja2Templates(directory=TEMPLATES_DIR)
app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
schnell_router = APIRouter(prefix="/schnell", tags=["schnell"])
dev_router = APIRouter(prefix="/dev", tags=["dev"])
images_router = APIRouter(prefix="/images", tags=["images"])
views_router = APIRouter(
    tags=["views"],
    include_in_schema=False
)


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


@app.get("/health")
async def health():
    if not await check_health():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ComfyUI is not healthy"
        )
    return {"status": "ok"}


@app.get("/queue", response_model=QueueSchema)
async def queue():
    queue_status = await get_queue_status()
    return QueueSchema(
        queue_pending=len(queue_status["queue_pending"]),
        queue_running=len(queue_status["queue_running"])
    )


@dev_router.post("/generate", status_code=status.HTTP_204_NO_CONTENT)
async def dev_generate(to_generate: GenerateSchema):
    try:
        # TODO: Add check that models are downloaded
        await generate("dev", **to_generate.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@dev_router.post("/generate/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def dev_generate_bulk(to_generate: list[GenerateSchema]):
    try:
        # TODO: Add check that models are downloaded
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
        # TODO: Add check that models are downloaded
        await generate("schnell", **to_generate.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@schnell_router.post("/generate/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def schnell_generate_bulk(to_generate: list[GenerateSchema]):
    try:
        # TODO: Add check that models are downloaded
        for generate_schema in to_generate:
            await generate(
                "schnell",
                **generate_schema.model_dump(exclude_none=True)
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@images_router.get("/download_all", response_class=FileResponse)
async def download_files():
    zip_filename = TEMP_DIR / f"output_{uuid4()}.zip"

    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        for root, dirs, files in os.walk(OUTPUT_DIR):
            logger.info(f"Files in {root}: {files}")
            for file in files:
                file_path = Path(root) / file
                zipf.write(file_path, file_path.relative_to(OUTPUT_DIR))
    logger.info(f"Downloading {zip_filename}")
    return FileResponse(
        zip_filename,
        filename=zip_filename.name,
        media_type="application/zip"
    )


@images_router.get("/download/{image_name}")
async def download_image(image_name: str):
    image_path = os.path.join(OUTPUT_DIR, image_name)
    return FileResponse(image_path)


@images_router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_files():
    try:
        for file in os.listdir(OUTPUT_DIR):
            logger.info(f"Deleting {file}")
            (OUTPUT_DIR / file).unlink()
        for file in os.listdir(TEMP_DIR):
            logger.info(f"Deleting {file}")
            (TEMP_DIR / file).unlink()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@images_router.delete("/{image_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(image_name: str):
    try:
        if (OUTPUT_DIR / image_name).exists():
            (OUTPUT_DIR / image_name).unlink()
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Image {image_name} not found"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@images_router.get("", response_model=ImagesSchema)
async def get_images(request: Request):
    try:
        return ImagesSchema(images=read_images(request))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@images_router.get("/{image_name}", response_class=FileResponse)
async def get_image(image_name: str):
    image_path = OUTPUT_DIR / image_name
    if image_path.exists():
        return FileResponse(image_path)
    raise HTTPException(status_code=404, detail="Image not found")


app.include_router(views_router)
app.include_router(schnell_router)
app.include_router(dev_router)
app.include_router(images_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="localhost", port=8000, reload=True)
