from typing import Optional
import os
import zipfile
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, APIRouter, status, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, Field
import subprocess

from modules.comfyui_flux_service import generate, get_queue_status
from config import COMFYUI_DIR, OUTPUT_DIR, TEMP_DIR


app = FastAPI()
schnell_router = APIRouter(prefix="/schnell", tags=["schnell"])
dev_router = APIRouter(prefix="/dev", tags=["dev"])

app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")


@app.on_event("startup")
async def startup():
    if not COMFYUI_DIR.exists():
        raise FileNotFoundError("ComfyUI not found")
    # subprocess.Popen(["python", (COMFYUI_DIR / "main.py")])


# @app.on_event("shutdown")
# async def shutdown():
#     subprocess.Popen(["pkill", "-f", (COMFYUI_DIR / "main.py")])


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


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/output", response_class=HTMLResponse)
async def display_png_files():
    png_files = sorted([f for f in os.listdir(OUTPUT_DIR) if f.endswith('.png')])
    html_content = "<html><body>"
    for png_file in png_files:
        image_url = f"/output/{png_file}"
        html_content += f'<div><img src="{image_url}" alt="{png_file}" style="max-width:500px;"></div>'
    html_content += "</body></html>"
    return html_content


@dev_router.post("/generate", status_code=status.HTTP_204_NO_CONTENT)
async def dev_generate(to_generate: GenerateSchema):
    try:
        generate("dev", **to_generate.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@dev_router.post("/generate/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def dev_generate_bulk(to_generate: list[GenerateSchema]):
    try:
        for generate_schema in to_generate:
            generate("dev", **generate_schema.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@schnell_router.post("/generate", status_code=status.HTTP_204_NO_CONTENT)
async def schnell_generate(to_generate: GenerateSchema):
    try:
        generate("schnell", **to_generate.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@schnell_router.post("/generate/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def schnell_generate_bulk(to_generate: list[GenerateSchema]):
    try:
        for generate_schema in to_generate:
            generate("schnell", **generate_schema.model_dump(exclude_none=True))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.get("/queue", response_model=QueueSchema)
async def queue():

    queue_status = get_queue_status()
    return QueueSchema(
        queue_pending=len(queue_status["queue_pending"]),
        queue_running=len(queue_status["queue_running"])
    )


@app.post("/download_files")
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


app.include_router(schnell_router)
app.include_router(dev_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
