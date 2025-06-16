from fastapi import APIRouter
from app.api.v1.endpoints import (
    dashboard,
    transactions,
    inventory,
    analytics,
    alerts,
    customer
)

api_router = APIRouter()

api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["dashboard"]
)

api_router.include_router(
    transactions.router,
    prefix="/transactions",
    tags=["transactions"]
)

api_router.include_router(
    inventory.router,
    prefix="/inventory",
    tags=["inventory"]
)

api_router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["analytics"]
)

api_router.include_router(
    alerts.router,
    prefix="/alerts",
    tags=["alerts"]
)

api_router.include_router(
    customer.router,
    prefix="/customers",
    tags=["customers"]
) 