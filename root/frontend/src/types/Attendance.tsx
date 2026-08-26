// types/Attendance.ts

import type { Athlete } from "./Athlete";

export interface Attendance {
  attendanceId?: number;
  athlete?: Athlete;
  individualComments?: string;

  freeskiRuns?: number;
  drillRuns?: number;
  educationalCourseRuns?: number;
  raceTrainingCourseRuns?: number;
  raceRuns?: number;
}