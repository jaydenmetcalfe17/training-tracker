//types/Team.tsx

import type { Club } from "./Club";

export interface Team {
  teamId: number;
  clubId: number;
  name: string;

  club?: Club;
}