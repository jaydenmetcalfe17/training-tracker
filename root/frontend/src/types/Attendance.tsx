// types/Attendance.ts

import type { Athlete } from "./Athlete";

export interface Attendance {
  attendanceId?: number;
  athlete: Athlete;
  individualComments?: string;
}