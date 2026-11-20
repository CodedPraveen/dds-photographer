"""Planned /api/v1/health endpoint; not implemented yet."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "dds-ai-service",
    }