from fastapi import APIRouter
from backend.app.api.v1.endpoints import health, info

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(info.router, tags=["System Info"])
