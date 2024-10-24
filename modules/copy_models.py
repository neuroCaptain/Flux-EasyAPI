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
            logger.info(f"Model {model.NAME} found.")
            tasks.append(model)

    if not tasks:
        logger.info("No local models found.")
        return
    else:
        logger.info(f"Found {len(tasks)} local models.")

    for model in tasks:
        logger.info(f"Copying {model.NAME} to {model.PATH}...")
        shutil.copy(path / model.NAME, model.PATH.value)
        logger.info(f"Copied {model.NAME} to {model.PATH}")
    logger.info(f"Copied {len(tasks)} models successfully.")
