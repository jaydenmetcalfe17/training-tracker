// types/TeamMembership.tsx

import type { Team } from "./Team";

export interface TeamMembership {
  teamMembershipId?: number;

  athleteId: number;
  teamId: number;

  startDate?: string | null;
  endDate?: string | null;

  team?: Team;
}