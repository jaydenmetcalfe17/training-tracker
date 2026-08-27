// dashboards/ParentDashboard/ParentDashboard.tsx

import {
  useContext,
  useEffect,
  useState,
} from "react";

import AuthContext from "../../context/AuthContext";
import type { Athlete } from "../../types/Athlete";

import AthletesSessions from "../../components/AthletesSessions/AthletesSessions";

import "./ParentDashboard.scss";


const ParentDashboard: React.FC = () => {

  const { user } =
    useContext(AuthContext);


  const [athletes, setAthletes] =
    useState<Athlete[]>([]);


  const [selectedAthleteId, setSelectedAthleteId] =
    useState<number | null>(null);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState<string | null>(null);


  // ----------------------------------------
  // Map athlete returned by API
  // ----------------------------------------

  const mapAthlete = (
    athlete: any
  ): Athlete => ({

    athleteId:
      athlete.athlete_id,

    athleteFirstName:
      athlete.athlete_first_name,

    athleteLastName:
      athlete.athlete_last_name,

    birthday:
      athlete.birthday,

    gender:
      athlete.gender,

    acaId:
      athlete.aca_id,

    fisId:
      athlete.fis_id,

    ageGroup:
      athlete.age_group,

    teamMemberships:
      (
        athlete.team_memberships ??
        []
      ).map(
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
                            membership
                              .team
                              .club
                              .club_id,

                          name:
                            membership
                              .team
                              .club
                              .name,

                        }
                      : undefined,

                }
              : undefined,

        })
      ),

  });


  // ----------------------------------------
  // Load parent's athletes
  // ----------------------------------------

  useEffect(() => {

    if (!user?.userId) {

      setLoading(false);

      return;
    }


    if (
      user.status !== "parent"
    ) {

      setLoading(false);

      return;
    }


    const loadAthletes =
      async () => {

        try {

          setLoading(true);

          setError(null);


          const response =
            await fetch(
              `/api/athlete?parentUserId=${user.userId}`,
              {
                method: "GET",

                headers: {
                  "Content-Type":
                    "application/json",
                },
              }
            );


          const data =
            await response.json();


          if (!response.ok) {

            throw new Error(
              data.error ||
              "Failed to load athletes"
            );
          }


          const loadedAthletes:
            Athlete[] =
            Array.isArray(data)
              ? data.map(mapAthlete)
              : [];


          setAthletes(
            loadedAthletes
          );


          // --------------------------------
          // Automatically select first
          // athlete
          // --------------------------------

          if (loadedAthletes.length > 0) {

            const firstAthlete =
              loadedAthletes[0];

            if (
              firstAthlete.athleteId !== undefined
            ) {

              setSelectedAthleteId(
                firstAthlete.athleteId
              );

            }

          }

        } catch (err) {

          console.error(
            "Unable to load parent athletes:",
            err
          );


          setError(
            err instanceof Error
              ? err.message
              : "Unable to load athletes."
          );

        } finally {

          setLoading(false);

        }
      };


    loadAthletes();

  }, [user]);


  // ----------------------------------------
  // Loading
  // ----------------------------------------

  if (loading) {

    return (
      <div className="athlete-dashboard-wrapper">
        Loading...
      </div>
    );

  }


  // ----------------------------------------
  // Error
  // ----------------------------------------

  if (error) {

    return (
      <div className="athlete-dashboard-wrapper">

        <p className="error-text">
          {error}
        </p>

      </div>
    );

  }


  // ----------------------------------------
  // No athletes
  // ----------------------------------------

  if (
    athletes.length === 0
  ) {

    return (
      <div className="athlete-dashboard-wrapper">

        <p>
          No athletes are currently
          associated with your account.
        </p>

      </div>
    );

  }


  // ----------------------------------------
  // Selected athlete
  // ----------------------------------------

  const selectedAthlete =
    athletes.find(
      (athlete) =>
        athlete.athleteId ===
        selectedAthleteId
    );


  if (!selectedAthlete) {

    return (
      <div className="athlete-dashboard-wrapper">
        Loading athlete...
      </div>
    );

  }


  // ----------------------------------------
  // Render
  // ----------------------------------------

  return (

    <div className="athlete-dashboard-wrapper">


      {/* ====================================== */}
      {/* ATHLETE SELECTOR                       */}
      {/* ====================================== */}

      <div className="parent-athlete-selector">

        <div className="parent-athlete-tabs">

          {athletes.map(
            (athlete) => (

              <button
                key={
                  athlete.athleteId
                }

                type="button"

                className={
                  selectedAthleteId ===
                  athlete.athleteId
                    ? "parent-athlete-tab active"
                    : "parent-athlete-tab"
                }

                onClick={() => {

                  if (
                    athlete.athleteId !== undefined
                  ) {

                    setSelectedAthleteId(
                      athlete.athleteId
                    );

                  }

                }}
              >

                {
                  athlete.athleteFirstName
                }{" "}

                {
                  athlete.athleteLastName
                }

              </button>

            )
          )}

        </div>

      </div>


      {/* ====================================== */}
      {/* SELECTED ATHLETE DASHBOARD              */}
      {/* ====================================== */}

      <AthletesSessions
        key={
          selectedAthlete.athleteId
        }

        athlete={
          selectedAthlete
        }

      />

    </div>

  );
};


export default ParentDashboard;