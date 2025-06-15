from fastapi import APIRouter

router = APIRouter()

@router.get("/overview")
async def get_dashboard_overview():
    """
    Get dashboard overview statistics
    """
    return {"message": "Dashboard overview endpoint"} 