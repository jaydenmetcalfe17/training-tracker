// types/CreateAthleteRequest.tsx

export interface CreateAthleteRequest {
  athleteFirstName: string;
  athleteLastName: string;
  birthday: string;
  gender: string;

  acaId?: number;
  fisId?: number;

  ageGroup?: string;

  // Used to create the athlete's initial team membership
  clubId?: number;
  teamId?: number;
}