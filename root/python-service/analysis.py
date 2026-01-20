# analysis.py
import pandas as pd
from config.database import engine
import json

with open("../backend/queries.json") as f:
    queries = json.load(f)


def load_sessions_df():
    query = queries["sessions"]["getAllSessions"]
    return pd.read_sql(query, engine)

def load_attendance_df():
    query = queries["attendance"]["getAllAttendance"]
    return pd.read_sql(query, engine)

# Example: more complex analysis
def session_summary():
    sessions = load_sessions_df()
    attendance = load_attendance_df()
    summary = attendance.groupby("session_id").size()
    return sessions

print (session_summary())