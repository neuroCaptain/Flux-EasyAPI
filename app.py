import os
import shutil
import uuid
from fastapi import FastAPI
from fastapi.responses import FileResponse

from config import OUTPUT_DIR, TEMP_DIR

app = FastAPI()

@app.get("/generate")
async def generate(
    prompt: str,
    seed: int,
    steps: int,
    cfg_scale: float,
    sampler: str,
    scheduler: str,
    width: int = 1920,
    height: int = 1080,
    model: str = "dev",
):
    return {"message": "Hello World"}

@app.get("/queue")
async def queue():
    return {"message": "Hello World"}

@app.delete("/queue/clear")
async def clear_queue():
    return {"message": "Hello World"}

@app.get("/download")
async def download():
    archive_name = f"{uuid.uuid4()}.zip"
    archive_path = TEMP_DIR / archive_name

    shutil.make_archive(archive_path.replace(".zip", ""), 'zip', OUTPUT_DIR)

    return FileResponse(path=archive_path, filename=archive_name, media_type='application/zip')
