from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_transactions():
    """
    Get all transactions
    """
    return {"message": "Transactions endpoint"} 