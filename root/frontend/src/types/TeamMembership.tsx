// types/TeamMembership.tsx

export interface TeamMembership {
  teamMembershipId: number;
  athleteId: number;
  teamId: number;

  startDate?: string | null;
  endDate?: string | null;

  team?: {
    teamId: number;
    clubId: number;
    name: string;

    club?: {
      clubId: number;
      name: string;
    };
  };
}