from enum import Enum
import random

import json
from pathlib import Path
from urllib import request, parse

from config import COMFYUI_BASE_URL, WORKFLOWS_DIR
from modules.logger import logger


class WorkflowPaths(Enum):
    DEV = WORKFLOWS_DIR / "flux_dev_workflow.json"
    SCHNELL = WORKFLOWS_DIR / "flux_schnell_workflow.json"


def load_workflow(workflow_path: Path):
    try:
        logger.info(f"Loading workflow from {workflow_path}")
        with open(workflow_path, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        logger.error(f"The file {workflow_path} was not found.")
        return None
    except json.JSONDecodeError:
        logger.error(f"The file {workflow_path} contains invalid JSON.")
        return None


def queue_prompt(nodes):
    prompt = {"prompt": nodes}
    data = json.dumps(prompt).encode("utf-8")
    req = request.Request(f"{COMFYUI_BASE_URL}/prompt", data=data)
    request.urlopen(req)


def prepare_schnell_workflow(
    prompt: str,
    width: int = 1920,
    height: int = 1080,
    batch_size: int = 1,
    noise_seed: int = random.randint(0, 2**64),
    steps: int = 4,
):
    logger.info("Preparing schnell workflow")
    workflow = load_workflow(WorkflowPaths.SCHNELL.value)
    workflow["5"]["inputs"]["width"] = width
    workflow["5"]["inputs"]["height"] = height
    workflow["5"]["inputs"]["batch_size"] = batch_size
    workflow["25"]["inputs"]["noise_seed"] = noise_seed
    workflow["17"]["inputs"]["steps"] = steps
    workflow["6"]["inputs"]["text"] = prompt
    logger.info("Schnell workflow prepared")
    return workflow


def prepare_dev_workflow(
    prompt: str,
    width: int = 1920,
    height: int = 1080,
    batch_size: int = 1,
    noise_seed: int = random.randint(0, 2**64),
    steps: int = 20,
):
    logger.info("Preparing dev workflow")
    workflow = load_workflow(WorkflowPaths.DEV.value)
    workflow["6"]["inputs"]["text"] = prompt
    workflow["27"]["inputs"]["width"] = width
    workflow["27"]["inputs"]["height"] = height
    workflow["27"]["inputs"]["batch_size"] = batch_size
    workflow["30"]["inputs"]["width"] = width
    workflow["30"]["inputs"]["height"] = height
    workflow["30"]["inputs"]["noise_seed"] = noise_seed
    workflow["17"]["inputs"]["steps"] = steps
    logger.info("Dev workflow prepared")
    return workflow


def generate(
    model: str,
    prompt: str,
    **kwargs
):
    logger.info(
        f"Generating with model {model} "
        f"with prompt: {prompt} and kwargs: {kwargs}"
    )
    if model == "dev":
        workflow = prepare_dev_workflow(
            prompt, **kwargs)
    elif model == "schnell":
        workflow = prepare_schnell_workflow(
            prompt, **kwargs)
    else:
        logger.error(f"Invalid model: {model}")
        raise ValueError(f"Invalid model: {model}")
    queue_prompt(workflow)

