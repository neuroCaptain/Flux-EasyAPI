import shutil
from pathlib import Path

from config import Models
from modules.logger import logger


def copy_local_models_from_dir(path: str):
    path = Path(path)
    logger.info(f"Finding local models in {path}...")
    tasks = []
    for model in Models:
        if (path / model.value.NAME).exists():
            logger.info(f"Model {model.value.NAME} found.")
            tasks.append(model)

    if not tasks:
        logger.info("No local models found.")
        return
    else:
        logger.info(f"Found {len(tasks)} local models.")

    for model in tasks:
        logger.info(f"Copying {model.value.NAME} to {model.value.PATH}...")
        shutil.copy(path / model.value.NAME, model.value.PATH)
        logger.info(f"Copied {model.value.NAME} to {model.value.PATH}")
    logger.info(f"Copied {len(tasks)} models successfully.")
