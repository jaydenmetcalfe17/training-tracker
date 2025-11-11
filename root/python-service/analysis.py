import pandas as pd
from config.database import engine

def load_sessions_df():
    query = "SELECT * FROM sessions;"
    return pd.read_sql(query, engine)

def load_attendance_df():
    query = "SELECT * FROM attendance;"
    return pd.read_sql(query, engine)

# Example: more complex analysis
def session_summary():
    sessions = load_sessions_df()
    attendance = load_attendance_df()
    summary = attendance.groupby("session_id").size()
    return summary
