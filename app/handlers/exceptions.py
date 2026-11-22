from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.exceptions.custom_exceptions import NotFoundError, BadRequestError, UnauthorizedError, ConflictError
from app.schemas.error import ErrorResponse

async def not_found_handler(request: Request, exc: NotFoundError):
    response = ErrorResponse(
        detail= str(exc),
        error_code= "NOT_FOUND",
    )
    return JSONResponse(
        status_code=404,
        content=response.model_dump()
    )

async def validation_error_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    response = ErrorResponse(
        detail = "validation error",
        error_code = "VALIDATION_ERROR",
        fields = [error["loc"][-1] for error in errors]
    )
    return JSONResponse(
        status_code=422,
        content=response.model_dump()
    )

async def bad_request_error_handler(request: Request, exc: BadRequestError):
    response = ErrorResponse(
        detail= str(exc),
        error_code= "BAD_REQUEST",
        fields= [exc.field]
    )
    return JSONResponse(
        status_code=400,
        content=response.model_dump()
    )

async def unauthorized_error_handler(request: Request, exc: UnauthorizedError):
    response = ErrorResponse(
        detail= str(exc),
        error_code= "UNAUTHORIZED",
    )
    return JSONResponse(
        status_code=401,
        content=response.model_dump()
    )

async def conflict_error_handler(request: Request, exc: ConflictError):
    response = ErrorResponse(
        detail= str(exc),
        error_code= "CONFLICT",
        fields= [exc.field]
    )
    return JSONResponse(
        status_code=409,
        content=response.model_dump()
    )
