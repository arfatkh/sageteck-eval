from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
import logging
import time

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.exceptions import (
    TechMartException,
    ValidationError,
    techmart_exception_handler,
    sqlalchemy_error_handler,
    validation_exception_handler
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Add exception handlers
app.add_exception_handler(TechMartException, techmart_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_error_handler)
app.add_exception_handler(ValidationError, validation_exception_handler)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    log_data = {
        "path": request.url.path,
        "method": request.method,
        "duration": f"{duration:.2f}s",
        "status_code": response.status_code
    }
    
    # Log client errors (4xx) and server errors (5xx) as warnings/errors
    if 400 <= response.status_code < 500:
        logger.warning(f"Client Error: {log_data}")
    elif response.status_code >= 500:
        logger.error(f"Server Error: {log_data}")
    else:
        logger.info(f"Request processed: {log_data}")
    
    return response

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to TechMart Analytics API",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    } 