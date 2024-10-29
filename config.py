import os
from enum import Enum
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()


def get_huggingface_token():
    return os.getenv("HUGGINGFACE_TOKEN")


BASE_DIR = Path(__file__).resolve().parent
TEMP_DIR = BASE_DIR / "temp"
TEMP_DIR.mkdir(exist_ok=True)
WORKFLOWS_DIR = BASE_DIR / "workflows"
STATIC_DIR = Path(__file__).parent / "ui/static"
TEMPLATES_DIR = Path(__file__).parent / "ui/templates"

ALLOWED_ORIGINS = ["http://localhost:3000"]

# ComfyUI
COMFYUI_REPO = "https://github.com/comfyanonymous/ComfyUI"

COMFYUI_BASE_URL = "http://127.0.0.1:8188"

COMFYUI_DIR = BASE_DIR / "ComfyUI"

MODEL_DIR = COMFYUI_DIR / "models"
UNET_DIR = MODEL_DIR / "unet"
CLIP_DIR = MODEL_DIR / "clip"
VAE_DIR = MODEL_DIR / "vae"
OUTPUT_DIR = COMFYUI_DIR / "output"


# Requirements
BASE_REQUIREMENTS_FILE = BASE_DIR / "requirements.txt"
COMFYUI_REQUIREMENTS_FILE = COMFYUI_DIR / "requirements.txt"


@dataclass
class Model:
    URL: str
    NAME: str
    PATH: Path


class Models(Enum):
    CLIPL = Model(
        URL="https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors",  # noqa: E501
        NAME="clip_l.safetensors",
        PATH=CLIP_DIR / "clip_l.safetensors"
    )
    FP16 = Model(
        URL="https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp16.safetensors",  # noqa: E501
        NAME="t5xxl_fp16.safetensors",
        PATH=CLIP_DIR / "t5xxl_fp16.safetensors"
    )
    FP8 = Model(
        URL="https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn.safetensors",  # noqa: E501
        NAME="t5xxl_fp8_e4m3fn.safetensors",
        PATH=CLIP_DIR / "t5xxl_fp8_e4m3fn.safetensors"
    )
    VAE = Model(
        URL="https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/ae.safetensors",  # noqa: E501
        NAME="ae.safetensors",
        PATH=VAE_DIR / "ae.safetensors"
    )
    FLUX_DEV = Model(
        URL="https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/flux1-dev.safetensors",  # noqa: E501
        NAME="flux1-dev.safetensors",
        PATH=UNET_DIR / "flux1-dev.safetensors"
    )
    FLUX_SCHNELL = Model(
        URL="https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/flux1-schnell.safetensors",  # noqa: E501
        NAME="flux1-schnell.safetensors",
        PATH=UNET_DIR / "flux1-schnell.safetensors"
    )

    @classmethod
    def get_model_by_name(cls, model_name: str) -> Model | None:
        for model in cls:
            if model.value.NAME == model_name:
                return model.value
        return None
