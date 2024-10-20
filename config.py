import os
from enum import Enum
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")


BASE_DIR = Path(__file__).resolve().parent
TEMP_DIR = BASE_DIR / "temp"
TEMP_DIR.mkdir(exist_ok=True)
WORKFLOWS_DIR = BASE_DIR / "workflows"
STATIC_DIR = Path(__file__).parent / "ui/static"
TEMPLATES_DIR = Path(__file__).parent / "ui/templates"

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


class ClipL(Enum):
    URL = "https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors"  # noqa: E501
    NAME = "clip_l.safetensors"
    PATH = CLIP_DIR / NAME


class FP16(Enum):
    URL = "https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp16.safetensors"  # noqa: E501
    NAME = "t5xxl_fp16.safetensors"
    PATH = CLIP_DIR / NAME


class FP8(Enum):
    URL = "https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn.safetensors"  # noqa: E501
    NAME = "t5xxl_fp8_e4m3fn.safetensors"
    PATH = CLIP_DIR / NAME


class VAE(Enum):
    URL = "https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/ae.safetensors"  # noqa: E501
    NAME = "ae.safetensors"
    PATH = VAE_DIR / NAME


class FluxDev(Enum):
    URL = "https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/flux1-dev.safetensors"  # noqa: E501
    NAME = "flux1-dev.safetensors"
    PATH = UNET_DIR / NAME


class FluxSchnell(Enum):
    URL = "https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/flux1-schnell.safetensors"  # noqa: E501
    NAME = "flux1-schnell.safetensors"
    PATH = UNET_DIR / NAME



