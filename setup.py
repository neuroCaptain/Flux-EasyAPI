import argparse
import subprocess
import asyncio
import os
import time
from pathlib import Path

from config import (
    COMFYUI_DIR,
    BASE_REQUIREMENTS_FILE,
    COMFYUI_REQUIREMENTS_FILE,
)
from modules.downloader import downloader
from modules.logger import logger


def upgrade_pip():
    logger.info("Upgrading pip...")
    subprocess.run(
        ["pip", "install", "--upgrade", "pip"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    logger.info("Pip upgraded.")


def install_requirements(requirements_file: Path):
    logger.info(f"Installing requirements from {requirements_file}...")
    subprocess.run(
        ["pip", "install", "-r", requirements_file],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    logger.info("Requirements installed.")


def check_comfyui():
    if not COMFYUI_DIR.exists():
        logger.error("ComfyUI directory not found.")
        return False
    return True


def install_comfyui():
    from git import Repo
    logger.info("Installing ComfyUI...")
    Repo.clone_from("https://github.com/comfyanonymous/ComfyUI", COMFYUI_DIR)
    logger.info("ComfyUI installed.")


def check_api_token():
    if os.getenv("HUGGINGFACE_TOKEN") is None:
        logger.error(
            "HUGGINGFACE_TOKEN is not set. You wont be able to "
            "download FluxDev model. You have 5 seconds to set it or "
            "ignore this message."
        )
        time.sleep(5)


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-r",
        "--reinstall",
        help="Reinstall the models if they are already present.",
        action="store_true"
    )
    parser.add_argument(
        "-m",
        "--models",
        help=(
            "List of models to download:\n"
            "1 - FP16.\n"
            "2 - FP8.\n"
            "3 - FluxDev.\n"
            "4 - FluxSchnell."
        ),
        nargs="*",
        choices=["1", "2", "3", "4"],
        metavar="MODEL"
    )
    parser.add_argument(
        "-t",
        "--token",
        help="HUGGINGFACE_TOKEN to download FluxDev model.",
    )
    args = parser.parse_args()

    if args.token:
        logger.info("Setting HUGGINGFACE_TOKEN...")
        os.environ["HUGGINGFACE_TOKEN"] = args.token
        logger.info("HUGGINGFACE_TOKEN set.")

    check_api_token()

    upgrade_pip()
    install_requirements(BASE_REQUIREMENTS_FILE)
    if not check_comfyui():
        install_comfyui()
    install_requirements(COMFYUI_REQUIREMENTS_FILE)
    await downloader(args.models, args.reinstall)


if __name__ == "__main__":
    asyncio.run(main())
