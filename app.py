from fastapi import FastAPI, APIRouter
from pydantic import BaseModel, Field

from modules.comfyui_flux_service import generate


app = FastAPI()
schnell_router = APIRouter(prefix="/schnell", tags=["schnell"])
dev_router = APIRouter(prefix="/dev", tags=["dev"])


class GenerateSchema(BaseModel):
    prompt: str
    width: int = Field(default=None)
    height: int = Field(default=None)
    batch_size: int = Field(default=None, ge=1, le=20)
    noise_seed: int = Field(default=None)
    steps: int = Field(default=None, ge=1, le=30)


@app.get("/health")
async def health():
    return {"status": "ok"}


@dev_router.post("/generate")
async def dev_generate_bulk(to_generate: GenerateSchema):
    generate("dev", to_generate.model_dump())


@schnell_router.post("/generate")
async def schnell_generate_bulk(to_generate: GenerateSchema):
    generate("schnell", to_generate.model_dump())


@app.get("/queue")
async def queue():
    pass


@app.post("/download_files")
async def download_files():
    pass


app.include_router(schnell_router)
app.include_router(dev_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
