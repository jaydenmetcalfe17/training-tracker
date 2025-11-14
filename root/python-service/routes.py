from fastapi import APIRouter
from analysis import session_summary
import pandas as pd
import numpy as np
import json
import traceback

router = APIRouter()

@router.get("/api/python/summary")
def get_summary():
    try:
        df = session_summary()

        # Just print the raw DataFrame to the Python console
        print("=== SESSION SUMMARY DATAFRAME ===")
        print(df)
        print("=== END OF DATAFRAME ===")

        # Return the raw DataFrame as a string (not JSON)
        return {"summary": df.to_string(index=False)}

    except Exception as e:
        print("Error in get_summary():", e)
        traceback.print_exc()
        return {"error": str(e)}