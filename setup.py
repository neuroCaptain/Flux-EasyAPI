import logging
import subprocess
import asyncio
from pathlib import Path

from config import (
    COMFYUI_DIR,
    BASE_REQUIREMENTS_FILE,
    COMFYUI_REQUIREMENTS_FILE,
)
from downloader.downloader import downloader


logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
)


def upgrade_pip():
    logger.info("Upgrading pip...")
    subprocess.run(["pip", "install", "--upgrade", "pip"])


def install_requirements(requirements_file: Path):
    logger.info(f"Installing requirements from {requirements_file}")
    subprocess.run(["pip", "install", "-r", requirements_file])


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


async def main():
    upgrade_pip()
    install_requirements(BASE_REQUIREMENTS_FILE)
    if not check_comfyui():
        install_comfyui()
    install_requirements(COMFYUI_REQUIREMENTS_FILE)
    await downloader()


if __name__ == "__main__":
    asyncio.run(main())
