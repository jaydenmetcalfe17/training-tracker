// pages/CreateAthletePage.tsx

import "./CreateAthletePage.scss";
import { useEffect, useState } from 'react';

import type { Athlete } from '../../types/Athlete';
import type { CreateAthleteRequest } from '../../types/CreateAthleteRequest';

import AthletesList from '../../components/AthletesList/AthletesList';
import CreateAthleteForm from '../../components/CreateAthleteForm/CreateAthleteForm';

const mapAthlete = (athlete: any): Athlete => ({
  athleteId: athlete.athlete_id,

  athleteFirstName: athlete.athlete_first_name,
  athleteLastName: athlete.athlete_last_name,

  birthday: athlete.birthday
    ? new Date(athlete.birthday)
        .toISOString()
        .split("T")[0]
    : "",

  gender: athlete.gender,

  acaId: athlete.aca_id,
  fisId: athlete.fis_id,
  ageGroup: athlete.age_group,

  teamMemberships:
    athlete.team_memberships?.map(
      (membership: any) => ({
        teamMembershipId:
          membership.team_membership_id,

        athleteId:
          membership.athlete_id,

        teamId:
          membership.team_id,

        startDate:
          membership.start_date,

        endDate:
          membership.end_date,

        team: membership.team
          ? {
              teamId:
                membership.team.team_id,

              clubId:
                membership.team.club_id,

              name:
                membership.team.name,

              club: membership.team.club
                ? {
                    clubId:
                      membership.team.club.club_id,

                    name:
                      membership.team.club.name,
                  }
                : undefined,
            }
          : undefined,
      })
    ) ?? [],
});

const CreateAthletePage: React.FC = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);

  // Load all athletes
  useEffect(() => {
    fetch(`/api/athlete`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load athletes');
        }

        return res.json();
      })
      .then((data) => {
        console.log("ATHLETE DATA: ", data);

        const loadedAthletes: Athlete[] =
          data.map(mapAthlete);

        setAthletes(loadedAthletes);

      })
      .catch((err) =>
        console.log(
          'Unable to find athletes: ',
          err
        )
      );
  }, []);

  // Create Athlete Profile
  const createAthleteProfile = (
    newAthlete: CreateAthleteRequest
  ) => {
    console.log(
      'CREATING ATHLETE:',
      newAthlete
    );

    fetch(`/api/athlete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAthlete),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
            'Failed to create athlete'
          );
        }

        return data;
      })
      .then((data) => {
        console.log(
          'Athlete created:',
          data
        );

        const createdAthlete = mapAthlete(data);

        setAthletes((prev) => [
          ...prev,
          createdAthlete,
        ]);

        window.location.reload();
      })
      .catch((err) => {
        console.error(
          'Failed to create athlete:',
          err
        );
      });
  };

  return (
    <div>
      <CreateAthleteForm
        onSubmit={createAthleteProfile}
      />

      <AthletesList
        athletes={athletes}
      />
    </div>
  );
};

export default CreateAthletePage;