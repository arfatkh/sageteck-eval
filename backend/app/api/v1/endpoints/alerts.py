from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_alerts():
    """
    Get system alerts
    """
    return {"message": "Alerts endpoint"} 