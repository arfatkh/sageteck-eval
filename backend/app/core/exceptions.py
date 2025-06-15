from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from typing import Any, Dict, Optional
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

class TechMartException(HTTPException):
    """Base exception for TechMart application"""
    def __init__(
        self,
        status_code: int,
        detail: Any = None,
        headers: Optional[Dict[str, str]] = None,
        error_code: str = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.headers = headers
        self.error_code = error_code

class DatabaseError(TechMartException):
    """Database related errors"""
    def __init__(self, detail: str = "Database error occurred"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            error_code="DATABASE_ERROR"
        )

class ResourceNotFound(TechMartException):
    """Resource not found error"""
    def __init__(self, resource: str, resource_id: Any = None):
        detail = f"{resource} not found"
        if resource_id:
            detail += f" with id {resource_id}"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code="RESOURCE_NOT_FOUND"
        )

class ValidationError(TechMartException):
    """Validation error"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            error_code="VALIDATION_ERROR"
        )

class BusinessLogicError(TechMartException):
    """Business logic related errors"""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code="BUSINESS_LOGIC_ERROR"
        )

async def techmart_exception_handler(request: Request, exc: TechMartException):
    """Handler for TechMart custom exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.detail,
                "path": request.url.path
            }
        },
        headers=exc.headers
    )

async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    """Handler for SQLAlchemy errors"""
    error_detail = "Database error occurred"
    if isinstance(exc, IntegrityError):
        error_detail = "Data integrity error: Possible duplicate or invalid reference"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "DATABASE_ERROR",
                "message": error_detail,
                "path": request.url.path
            }
        }
    )

async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handler for validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": exc.detail,
                "path": request.url.path
            }
        }
    ) 