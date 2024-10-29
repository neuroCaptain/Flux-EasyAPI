from contextlib import asynccontextmanager
from typing import Optional
import os
import zipfile
from pathlib import Path
from uuid import uuid4
import asyncio
import yaml
from enum import StrEnum

from fastapi.openapi.utils import get_openapi
from fastapi import (
    FastAPI, APIRouter, status, HTTPException, BackgroundTasks
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field
from fastapi.templating import Jinja2Templates

from modules.comfyui_flux_service import (
    generate,
    get_queue_status,
    check_health,
)
from modules.logger import logger
from modules.background_tasks import download_model_in_background
from config import (
    COMFYUI_DIR,
    OUTPUT_DIR,
    TEMP_DIR,
    STATIC_DIR,
    TEMPLATES_DIR,
    ALLOWED_ORIGINS,
    Models,
)

# TODO move to state. Clear after each request?
ERROR_MESSAGES = []


# UTILS
def read_images():
    images = [
        img for img in os.listdir(OUTPUT_DIR) if img.endswith(".png")
    ]
    return images


def parce_models():
    models = []
    for model in Models:
        is_installed = ModelInstalledStatus.NOT_INSTALLED.value
        if model.value.NAME in app.state.bg_tasks:
            is_installed = ModelInstalledStatus.INSTALLING.value
        elif model.value.PATH.exists():
            is_installed = ModelInstalledStatus.INSTALLED.value
        models.append(
            ModelSchema(
                model=model.value.NAME,
                url=model.value.URL,
                is_installed=is_installed
            )
        )
    return models


def parse_error_message(line_text):
    if (
        "Traceback" in line_text or
        "Exception" in line_text or
        "Error" in line_text
    ):
        return line_text
    return None


async def read_stdout(stdout):
    while True:
        line = await stdout.readline()
        if line:
            line_text = line.decode().strip()
            if not line_text == "":
                error_message = parse_error_message(line_text)
                if error_message:
                    logger.comfyui_error(error_message)
                    ERROR_MESSAGES.append(error_message)
                else:
                    logger.comfyui(f"{line_text}")
        else:
            break


async def read_stderr(stderr):
    while True:
        line = await stderr.readline()
        if line:
            line_text = line.decode().strip()
            if not line_text == "":
                error_message = parse_error_message(line_text)
                if error_message:
                    logger.comfyui_error(error_message)
                    ERROR_MESSAGES.append(error_message)
                else:
                    logger.comfyui(f"{line_text}")
        else:
            break


def raise_comfyui_error():
    if ERROR_MESSAGES:
        msg = "\n".join(ERROR_MESSAGES)
        ERROR_MESSAGES.clear()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=msg)


# Schemas
class GenerateSchema(BaseModel):
    prompt: str
    width: Optional[int] = Field(default=1920)
    height: Optional[int] = Field(default=1080)
    batch_size: Optional[int] = Field(default=1, ge=1, le=20)
    noise_seed: Optional[int] = Field(default=42)
    steps: Optional[int] = Field(default=None, ge=1, le=50)


class GenerateDevSchema(GenerateSchema):
    steps: Optional[int] = Field(default=20, ge=1, le=50)


class GenerateSchnellSchema(GenerateSchema):
    steps: Optional[int] = Field(default=4, ge=1, le=50)


class QueueSchema(BaseModel):
    queue_pending: int
    queue_running: int


class ImageSchema(BaseModel):
    image_name: str


class ImagesSchema(BaseModel):
    images: list[str]


class ModelInstalledStatus(StrEnum):
    INSTALLED = "installed"
    NOT_INSTALLED = "not installed"
    INSTALLING = "installing"


class ModelSchema(BaseModel):
    model: str
    url: str
    is_installed: ModelInstalledStatus


# APP
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ComfyUI...")
    process = await asyncio.create_subprocess_exec(
        "python", str(COMFYUI_DIR / "main.py"),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    app.state.comfyui_process = process
    logger.info("ComfyUI started")

    app.state.stdout_task = asyncio.create_task(read_stdout(process.stdout))
    app.state.stderr_task = asyncio.create_task(read_stderr(process.stderr))

    app.state.bg_tasks = set()

    yield

    logger.info("Stopping ComfyUI...")
    process.terminate()
    await process.wait()
    logger.info("ComfyUI stopped")


app = FastAPI(lifespan=lifespan)
templates = Jinja2Templates(directory=TEMPLATES_DIR)
app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="next_static")

# app.mount("/_next", StaticFiles(directory=STATIC_DIR / "_next"), name="next")
models_router = APIRouter(prefix="/models", tags=["models"])
schnell_router = APIRouter(prefix="/schnell", tags=["schnell"])
dev_router = APIRouter(prefix="/dev", tags=["dev"])
images_router = APIRouter(prefix="/images", tags=["images"])
views_router = APIRouter(
    prefix="/views", tags=["views"], include_in_schema=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.get("/")
# async def root():
#     return FileResponse(STATIC_DIR / "index.html")


# @views_router.get("/settings")
# async def settings():
#     return FileResponse(STATIC_DIR / "settings.html")


# API
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


@models_router.get("", response_model=list[ModelSchema])
async def available_models():
    return parce_models()


@models_router.get(
    "/{model_name}/download", status_code=status.HTTP_204_NO_CONTENT
)
async def download_model(model_name: str, background_tasks: BackgroundTasks):
    model = Models.get_model_by_name(model_name)
    if model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    if model.PATH.exists():
        raise HTTPException(status_code=400, detail="Model already downloaded")

    background_tasks.add_task(
        download_model_in_background,
        app,
        model.NAME,
        model.URL,
        model.PATH
    )


@models_router.delete("/{model_name}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(model_name: str):
    model = Models.get_model_by_name(model_name)
    if model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    if not model.PATH.exists():
        raise HTTPException(status_code=400, detail="Model not downloaded")
    model.PATH.unlink()


# API DEV
@dev_router.post("/generate", status_code=status.HTTP_204_NO_CONTENT)
async def dev_generate(to_generate: GenerateDevSchema):
    try:
        await generate("dev", **to_generate.model_dump(exclude_none=True))
        raise_comfyui_error()
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@dev_router.post("/generate/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def dev_generate_bulk(to_generate: list[GenerateDevSchema]):
    try:
        for generate_schema in to_generate:
            await generate(
                "dev",
                **generate_schema.model_dump(exclude_none=True)
            )
        raise_comfyui_error()
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# API SCHNELL
@schnell_router.post("/generate", status_code=status.HTTP_204_NO_CONTENT)
async def schnell_generate(to_generate: GenerateSchnellSchema):
    try:
        await generate("schnell", **to_generate.model_dump(exclude_none=True))
        raise_comfyui_error()
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@schnell_router.post("/generate/bulk", status_code=status.HTTP_204_NO_CONTENT)
async def schnell_generate_bulk(to_generate: list[GenerateSchnellSchema]):
    try:
        for generate_schema in to_generate:
            await generate(
                "schnell",
                **generate_schema.model_dump(exclude_none=True)
            )
            raise_comfyui_error()
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# API IMAGES
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
async def get_images():
    try:
        return ImagesSchema(images=read_images())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@images_router.get("/{image_name}", response_class=FileResponse)
async def get_image(image_name: str):
    image_path = OUTPUT_DIR / image_name
    if image_path.exists():
        return FileResponse(image_path)
    raise HTTPException(status_code=404, detail="Image not found")


app.include_router(schnell_router)
app.include_router(dev_router)
app.include_router(images_router)
app.include_router(models_router)
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")


@app.get("/export_docs")
async def export_docs():
    openapi_schema = get_openapi(
        title="Flux-EasyAPI",
        version="1.0.0",
        description="Generate images with Flux",
        routes=app.routes,
    )

    yaml_content = yaml.dump(openapi_schema, sort_keys=False)

    return Response(
        content=yaml_content,
        media_type="application/x-yaml",
        headers={
            "Content-Disposition": "attachment; filename=openapi_schema.yaml"
        }
    )


if __name__ == "__main__":
    # Checks before starting the app
    if not COMFYUI_DIR.exists():
        msg = "ComfyUI directory not found"
        logger.error(msg)
        raise FileNotFoundError(msg)
    try:
        import torch
        pytorch_version = torch.__version__
        logger.info(f"PyTorch version: {pytorch_version}")

        if torch.cuda.is_available():
            cuda_version = torch.version.cuda
            logger.info(f"CUDA version: {cuda_version}")
        else:
            logger.warning("CUDA version: CUDA not available.")
    except ImportError:
        logger.error("PyTorch is not installed.")
        raise

    import uvicorn
    uvicorn.run("app:app", host="localhost", port=8000, reload=True)
