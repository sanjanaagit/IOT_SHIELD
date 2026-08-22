from datetime import datetime, timezone
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., description="Current operational status of the service", json_schema_extra={"example": "healthy"})
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp of the health check")
    environment: str = Field(..., description="Application execution environment", json_schema_extra={"example": "development"})
    version: str = Field(..., description="Application version", json_schema_extra={"example": "0.1.0"})

