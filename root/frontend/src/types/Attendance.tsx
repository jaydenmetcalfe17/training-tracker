// types/Attendance.ts

import type { Athlete } from "./Athlete";

export interface Attendance {
  attendanceId?: number;

  athlete?: Athlete;

  individualComments?: string;

  freeskiRuns?: number | null;

  drillRuns?: number | null;

  educationalCourseRuns?: number | null;

  raceTrainingCourseRuns?: number | null;

  raceRuns?: number | null;
}