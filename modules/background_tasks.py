from fastapi import FastAPI

from modules.downloader import download_model
from modules.logger import logger


async def download_model_in_background(
        app: FastAPI,
        model_name: str,
        url: str,
        destination_path: str
):
    app.state.bg_tasks.add(model_name)
    logger.info(f"Downloading {model_name} from {url}")

    await download_model(url, destination_path)

    app.state.bg_tasks.remove(model_name)
    logger.info(f"{model_name} has been downloaded and removed from bg_tasks.")
