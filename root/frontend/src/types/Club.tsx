//types/Club.tsx

import type { Team } from "./Team";

export interface Club {
  clubId: number;
  name: string;
  teams: Team[];
}