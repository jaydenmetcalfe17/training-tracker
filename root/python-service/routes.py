from fastapi import APIRouter
from analysis import session_summary

router = APIRouter()

@router.get("/summary")
def get_summary():
    return {"summary": session_summary().to_dict()}

@router.get("/")
def read_root():
    return {"message": "Hello from sessions router!"}