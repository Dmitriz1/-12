from typing import Optional

from pydantic import BaseModel

class ErrorResponse(BaseModel):
    detail: str
    error_code: str
    fields: Optional[list[str]] = None