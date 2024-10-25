from enum import Enum
import random
import json
from pathlib import Path

from fastapi import HTTPException, status
import aiohttp

from config import COMFYUI_BASE_URL, WORKFLOWS_DIR, Models
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
                print(response.status)
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
    noise_seed: int | None = None,
    steps: int = 4,
):
    logger.info("Preparing schnell workflow")
    workflow = load_workflow(WorkflowPaths.SCHNELL.value)
    workflow["5"]["inputs"]["width"] = width
    workflow["5"]["inputs"]["height"] = height
    workflow["5"]["inputs"]["batch_size"] = batch_size
    workflow["25"]["inputs"]["noise_seed"] = (
        get_random_noise_seed() if noise_seed is None else noise_seed
    )
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
    noise_seed: int | None = None,
    steps: int = 20,
):
    logger.info("Preparing dev workflow")
    workflow = load_workflow(WorkflowPaths.DEV.value)
    workflow["6"]["inputs"]["text"] = prompt
    workflow["25"]["inputs"]["noise_seed"] = (
        get_random_noise_seed() if noise_seed is None else noise_seed
    )
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


def check_dev_workflow_requirements():
    errors = []
    msg = "Model: {model_name} not found"
    if not Models.FLUX_DEV.value.PATH.exists():
        model_name = Models.FLUX_DEV.value.NAME
        logger.error(msg.format(model_name=model_name))
        errors.append(model_name)
    if not Models.CLIPL.value.PATH.exists():
        model_name = Models.CLIPL.value.NAME
        logger.error(msg.format(model_name=model_name))
        errors.append(model_name)
    if not Models.FP16.value.PATH.exists():
        model_name = Models.FP16.value.NAME
        logger.error(msg.format(model_name=model_name))
        errors.append(model_name)
    # TODO: Make option to use FP8 for dev workflow
    # elif not Models.FP8.value.PATH.exists():
    #     model_name = Models.FP8.value.NAME
    #     logger.error(msg.format(model_name=model_name))
    #     errors.append(model_name)
    if not Models.VAE.value.PATH.exists():
        model_name = Models.VAE.value.NAME
        logger.error(msg.format(model_name=model_name))
        errors.append(model_name)
    if errors:
        raise FileNotFoundError(msg.format(model_name=", ".join(errors)))


def check_schnell_workflow_requirements():
    errors = []
    msg = "Model: {model_name} not found"
    if not Models.FLUX_SCHNELL.value.PATH.exists():
        model_name = Models.FLUX_SCHNELL.value.NAME
        logger.error(msg.format(model_name=model_name))
        errors.append(model_name)
    if not Models.CLIPL.value.PATH.exists():
        model_name = Models.CLIPL.value.NAME
        logger.error(msg.format(model_name=model_name))
        errors.append(model_name)
    if not Models.FP8.value.PATH.exists():
        model_name = Models.FP8.value.NAME
        logger.error(msg.format(model_name=model_name))
        errors.append(model_name)
    # TODO: Make option to use FP16 for schnell workflow
    # elif not Models.FP16.value.PATH.exists():
    #     model_name = Models.FP16.value.NAME
    #     logger.error(msg.format(model_name=model_name))
    #     errors.append(model_name)
    if not Models.VAE.value.PATH.exists():
        model_name = Models.VAE.value.NAME
        logger.error(msg.format(model_name=model_name))
        errors.append(model_name)
    if errors:
        raise FileNotFoundError(msg.format(model_name=", ".join(errors)))


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
        check_dev_workflow_requirements()
        workflow = prepare_dev_workflow(
            prompt, **kwargs)
    elif model == "schnell":
        check_schnell_workflow_requirements()
        workflow = prepare_schnell_workflow(
            prompt, **kwargs)
    else:
        logger.error(f"Invalid model: {model}")
        raise ValueError(f"Invalid model: {model}")
    return await queue_prompt(workflow)

