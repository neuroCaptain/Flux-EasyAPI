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
        copy_from_path = path / model.value.NAME
        if model.value.PATH.exists():
            logger.error(f"Model {model.value.NAME} already exists.")      
            continue
        logger.info(f"Copying {copy_from_path} to {model.value.PATH}...")
        shutil.copy(copy_from_path, model.value.PATH)
        logger.info(f"Copied {copy_from_path} to {model.value.PATH}")
    logger.info(f"Copied {len(tasks)} models successfully.")
