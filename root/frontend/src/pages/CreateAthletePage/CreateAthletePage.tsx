// pages/CreateAthletePage/CreateAthletePage.tsx

import "./CreateAthletePage.scss";
import { useEffect, useState } from "react";

import type { Athlete } from "../../types/Athlete";
import type { CreateAthleteRequest } from "../../types/CreateAthleteRequest";

import AthletesList from "../../components/AthletesList/AthletesList";
import CreateAthleteForm from "../../components/CreateAthleteForm/CreateAthleteForm";

interface CreateAthletePageProps {
  teamId?: number;
  clubId?: number;
}

const mapAthlete = (athlete: any): Athlete => ({
  athleteId: athlete.athlete_id,

  athleteFirstName:
    athlete.athlete_first_name,

  athleteLastName:
    athlete.athlete_last_name,

  birthday:
    athlete.birthday
      ? new Date(athlete.birthday)
          .toISOString()
          .split("T")[0]
      : "",

  gender:
    athlete.gender,

  acaId:
    athlete.aca_id,

  fisId:
    athlete.fis_id,

  ageGroup:
    athlete.age_group,

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

        team:
          membership.team
            ? {
                teamId:
                  membership.team.team_id,

                clubId:
                  membership.team.club_id,

                name:
                  membership.team.name,

                club:
                  membership.team.club
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


const CreateAthletePage: React.FC<
  CreateAthletePageProps
> = ({
  teamId,
  clubId,
}) => {

  const [athletes, setAthletes] =
    useState<Athlete[]>([]);

  // ----------------------------------------
  // Load athletes currently on this team
  // ----------------------------------------

  useEffect(() => {

    if (!teamId) {
      setAthletes([]);
      return;
    }

    fetch(
      `/api/athlete?teamId=${teamId}`,
      {
        method: "GET",
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    )
      .then((res) => {

        if (!res.ok) {
          throw new Error(
            "Failed to load athletes"
          );
        }

        return res.json();
      })
      .then((data) => {

        const loadedAthletes:
          Athlete[] =
          data.map(mapAthlete);

        setAthletes(
          loadedAthletes
        );
      })
      .catch((err) => {

        console.error(
          "Unable to find athletes:",
          err
        );

        setAthletes([]);
      });

  }, [teamId]);


  // ----------------------------------------
  // Create new athlete OR add existing athlete
  // ----------------------------------------

  const handleAthleteSubmit = async (
    athlete: CreateAthleteRequest
  ) => {

    if (!teamId) {

      console.error(
        "Cannot add athlete without a team"
      );

      throw new Error(
        "No team selected"
      );
    }


    try {

      const response =
        await fetch(
          `/api/athlete`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              ...athlete,

              // The backend expects an array
              // of team IDs.
              teamIds: [
                teamId
              ],

              // Keep teamId as well for compatibility
              // with the existing create-athlete logic.
              teamId: teamId,
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Failed to add athlete"
        );
      }


      console.log(
        "Athlete added:",
        data
      );


      const addedAthlete =
        mapAthlete(data);


      // --------------------------------------
      // Add athlete to local list
      // --------------------------------------

      setAthletes(
        (prev) => {

          const alreadyExists =
            prev.some(
              (existing) =>
                existing.athleteId ===
                addedAthlete.athleteId
            );


          if (alreadyExists) {
            return prev;
          }


          return [
            ...prev,
            addedAthlete,
          ];
        }
      );


      // --------------------------------------
      // Refresh page
      // --------------------------------------

      window.location.reload();


    } catch (error) {

      console.error(
        "Failed to add athlete:",
        error
      );

      throw error;
    }
  };


  return (
    <div className="create-athlete-page">

      <AthletesList
        athletes={athletes}
      />

      <CreateAthleteForm
        onSubmit={
          handleAthleteSubmit
        }

        teamId={
          teamId
        }

        clubId={
          clubId
        }
      />

    </div>
  );
};


export default CreateAthletePage;