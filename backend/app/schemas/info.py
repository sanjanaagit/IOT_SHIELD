from typing import List
from pydantic import BaseModel, Field


class SystemInfoResponse(BaseModel):
    project_name: str = Field(..., description="Project name", json_schema_extra={"example": "IoTShield"})
    version: str = Field(..., description="Semantic version", json_schema_extra={"example": "0.1.0"})
    stage: str = Field(..., description="Current development phase", json_schema_extra={"example": "Stage 1 - Project Foundation"})
    description: str = Field(..., description="Project overview")
    status: str = Field(..., description="System status", json_schema_extra={"example": "online"})
    capabilities: List[str] = Field(..., description="Active platform capabilities in current stage")

