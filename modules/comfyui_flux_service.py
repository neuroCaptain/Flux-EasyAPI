from enum import Enum
import random
import json
from pathlib import Path

from fastapi import HTTPException, status
import aiohttp

from config import COMFYUI_BASE_URL, WORKFLOWS_DIR
from modules.logger import logger


class WorkflowPaths(Enum):
    DEV = WORKFLOWS_DIR / "flux_dev_workflow.json"
    SCHNELL = WORKFLOWS_DIR / "flux_schnell_workflow.json"


def get_random_noise_seed() -> int:
    return random.randint(0, 2**64)


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


async def queue_prompt(nodes):
    prompt = {"prompt": nodes}
    data = json.dumps(prompt).encode("utf-8")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{COMFYUI_BASE_URL}/prompt", data=data) as response:
                response_json = await response.json()
                response.raise_for_status()
                return response_json
    except aiohttp.ClientError as e:
        logger.error(f"Failed to queue prompt: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to queue prompt: {e} {response_json}"
        )


async def get_queue_status():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{COMFYUI_BASE_URL}/queue") as response:
                return await response.json()
    except aiohttp.ClientError as e:
        logger.error(f"Failed to get queue status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get queue status"
        )


async def check_health():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{COMFYUI_BASE_URL}") as response:
                return response.status == 200
    except aiohttp.ClientError as e:
        logger.error(f"Failed to check health: {e}")
        return False


def prepare_schnell_workflow(
    prompt: str,
    width: int = 1920,
    height: int = 1080,
    batch_size: int = 1,
    noise_seed: int = 42,
    steps: int = 4,
):
    logger.info("Preparing schnell workflow")
    noise_seed = get_random_noise_seed() if noise_seed == 42 else noise_seed
    workflow = load_workflow(WorkflowPaths.SCHNELL.value)
    workflow["5"]["inputs"]["width"] = width
    workflow["5"]["inputs"]["height"] = height
    workflow["5"]["inputs"]["batch_size"] = batch_size
    workflow["25"]["inputs"]["noise_seed"] = noise_seed
    workflow["17"]["inputs"]["steps"] = steps
    workflow["6"]["inputs"]["text"] = prompt
    logger.info(
        f"Schnell workflow prepared with prompt: {prompt}, "
        f"width: {width}, height: {height}, batch_size: {batch_size}, "
        f"noise_seed: {noise_seed}, steps: {steps}"
    )
    return workflow


def prepare_dev_workflow(
    prompt: str,
    width: int = 1920,
    height: int = 1080,
    batch_size: int = 1,
    noise_seed: int = 42,
    steps: int = 20,
):
    logger.info("Preparing dev workflow")
    noise_seed = get_random_noise_seed() if noise_seed == 42 else noise_seed
    workflow = load_workflow(WorkflowPaths.DEV.value)
    workflow["6"]["inputs"]["text"] = prompt
    workflow["25"]["inputs"]["noise_seed"] = noise_seed
    workflow["27"]["inputs"]["width"] = width
    workflow["27"]["inputs"]["height"] = height
    workflow["27"]["inputs"]["batch_size"] = batch_size
    workflow["30"]["inputs"]["width"] = width
    workflow["30"]["inputs"]["height"] = height
    workflow["17"]["inputs"]["steps"] = steps

    logger.info(
        f"Dev workflow prepared with prompt: {prompt}, "
        f"width: {width}, height: {height}, batch_size: {batch_size}, "
        f"noise_seed: {noise_seed}, steps: {steps}"
    )
    return workflow


async def generate(
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
    return await queue_prompt(workflow)

