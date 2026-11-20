"""Planned FastAPI application entry point; not implemented yet."""
from fastapi import FastAPI

from app.api.health import router as health_router
from app.config import settings
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)

app.include_router(
    health_router,
    prefix=settings.API_PREFIX,
    tags=["Health"],
)


@app.get("/")
async def root():
    return {
        "message": "DDS AI Service is running",
    }
    