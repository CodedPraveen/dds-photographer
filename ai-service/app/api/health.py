import logging

import psycopg
from fastapi import APIRouter, HTTPException

from app.db.connection import check_database_connection

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "dds-ai-service",
    }


@router.get("/ready")
def readiness_check():
    try:
        if not check_database_connection():
            raise RuntimeError("Database check failed")

        return {
            "status": "ok",
            "database": "connected",
        }

    except (psycopg.Error, RuntimeError):
        logger.exception("Database readiness check failed")

        raise HTTPException(
            status_code=503,
            detail="Database unavailable",
        )