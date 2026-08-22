from fastapi import APIRouter, status
from backend.app.core.config import settings
from backend.app.schemas.info import SystemInfoResponse

router = APIRouter()


@router.get(
    "/info",
    response_model=SystemInfoResponse,
    status_code=status.HTTP_200_OK,
    summary="System Information",
    description="Returns metadata about the IoTShield project, current stage, and active capabilities.",
)
async def get_system_info() -> SystemInfoResponse:
    return SystemInfoResponse(
        project_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        stage=settings.STAGE,
        description=settings.DESCRIPTION,
        status="online",
        capabilities=[
            "Base API Infrastructure",
            "Health Checks & Diagnostics",
            "System Information & Metadata",
            "Modular Architecture Routing",
        ],
    )
