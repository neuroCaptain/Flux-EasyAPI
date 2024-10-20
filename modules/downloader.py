import asyncio
from pathlib import Path

import aiohttp
from tqdm import tqdm

from modules.logger import logger
from config import (
    HUGGINGFACE_TOKEN,
    ClipL,
    VAE,
    FP16,
    FP8,
    FluxDev,
    FluxSchnell,
)


TO_DOWNLOAD = [VAE, ClipL]


async def download_model(url: str, destination_path: Path):
    try:
        timeout = aiohttp.ClientTimeout(total=None)
        async with aiohttp.ClientSession(
            trust_env=True,
            connector=aiohttp.TCPConnector(ssl=False),
            timeout=timeout,
            headers={"Authorization": f"Bearer {HUGGINGFACE_TOKEN}"},
        ) as session:
            async with session.get(url) as response:
                if response.status == 200:
                    total_size = int(response.headers.get("Content-Length", 0))
                    chunk_size = 1024
                    with tqdm(
                        total=total_size,
                        unit="iB",
                        unit_scale=True,
                        desc=destination_path.name,
                    ) as bar:
                        with destination_path.open("wb") as f:
                            async for chunk in response.content.iter_chunked(
                                chunk_size
                            ):
                                f.write(chunk)
                                bar.update(len(chunk))
                else:
                    logger.error(
                        f"Failed to download {url}. "
                        f"Status code: {response.status}"
                    )
    except aiohttp.ClientError as e:
        logger.error(f"Failed to download {url}. Error: {e}")
    except asyncio.TimeoutError:
        logger.error(
            "Download timed out. Please check your internet "
            "connection and try again."
        )


def clips_menu():
    clips_menu = (
        "What clip encoder do you want to download?\n"
        "[1] FP16 (If you have more than 32GB RAM)\n"
        "[2] FP8 (If you have less than 32GB RAM)\n"
        "[3] All\n"
        "[4] Skip\n"
    )
    print(clips_menu)
    choice = input("Enter your choice: ")
    while choice not in ["1", "2", "3", "4"]:
        print("Invalid choice")
        choice = input("Enter your choice: ")
    if choice == "1":
        TO_DOWNLOAD.append(FP16)
    elif choice == "2":
        TO_DOWNLOAD.append(FP8)
    elif choice == "3":
        TO_DOWNLOAD.append(FP16)
        TO_DOWNLOAD.append(FP8)
    elif choice == "4":
        pass


def models_menu():
    models_menu = (
        "What model do you want to download?\n"
        "[1] FluxDev\n"
        "[2] FluxSchnell\n"
        "[3] All\n"
        "[4] Skip\n"
    )
    print(models_menu)
    choice = input("Enter your choice: ")
    while choice not in ["1", "2", "3", "4"]:
        print("Invalid choice")
        choice = input("Enter your choice: ")
    if choice == "1":
        TO_DOWNLOAD.append(FluxDev)
    elif choice == "2":
        TO_DOWNLOAD.append(FluxSchnell)
    elif choice == "3":
        TO_DOWNLOAD.append(FluxDev)
        TO_DOWNLOAD.append(FluxSchnell)
    elif choice == "4":
        pass


async def download(reinstall: bool = False):
    tasks = []
    for model in TO_DOWNLOAD:
        if model.PATH.value.exists():
            logger.info(f"{model.NAME.value} already exists.")
            if not reinstall:
                print("Do you want to download it again?")
                choice = input("Enter your choice (y/n): ")
                while choice not in ["y", "n"]:
                    print("Invalid choice")
                    choice = input("Enter your choice (y/n): ")
            else:
                logger.info(f"{model.NAME.value} will be reinstalled.")
                choice = "y"
            if choice == "y":
                model.PATH.value.unlink()
                tasks.append(download_model(model.URL.value, model.PATH.value))
        else:
            tasks.append(download_model(model.URL.value, model.PATH.value))
    await asyncio.gather(*tasks)


async def downloader(choices: set[str] | None = None, reinstall: bool = False):
    if choices is None:
        clips_menu()
        models_menu()
    else:
        logger.info("Silently downloading models...")
        for choice in choices:
            if choice == "1":
                TO_DOWNLOAD.append(FP16)
            elif choice == "2":
                TO_DOWNLOAD.append(FP8)
            elif choice == "3":
                TO_DOWNLOAD.append(FluxDev)
            elif choice == "4":
                TO_DOWNLOAD.append(FluxSchnell)
    await download(reinstall)


if __name__ == "__main__":
    asyncio.run(downloader())
