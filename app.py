from typing import Optional
import os
import zipfile
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import subprocess

from modules.comfyui_flux_service import generate
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


@app.get("/health")
async def health():
    return {"status": "ok"}


@dev_router.post("/generate")
async def dev_generate_bulk(to_generate: GenerateSchema):
    generate("dev", to_generate.model_dump(exclude_none=True))


@schnell_router.post("/generate")
async def schnell_generate_bulk(to_generate: GenerateSchema):
    generate("schnell", to_generate.model_dump(exclude_none=True))


@app.get("/queue")
async def queue():
    pass


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
