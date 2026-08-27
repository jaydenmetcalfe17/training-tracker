// dashboards/ClubDashboard/ClubDashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Team } from "../../types/Team";
import type { Athlete } from "../../types/Athlete";
import type { Session } from "../../types/Session";

import GenerateInviteButton from "../../components/GenerateInviteButton/GenerateInviteButton";
import PieChart from "../../components/PieChart/PieChart";
import MiniAthletesList from "../../components/MiniAthletesList/MiniAthletesList";
import MiniSessionsList from "../../components/MiniSessionsList/MiniSessionsList";

import "./ClubDashboard.scss";

interface Club {
  clubId: number;
  name: string;
}

const ClubDashboard: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();

  const [club, setClub] =
    useState<Club | null>(null);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [athletes, setAthletes] =
    useState<Athlete[]>([]);

  const [sessions, setSessions] =
    useState<Session[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!clubId) {
      return;
    }

    const parsedClubId =
      Number(clubId);

    if (!Number.isInteger(parsedClubId)) {
      console.error(
        "Invalid club ID:",
        clubId
      );

      setLoading(false);
      return;
    }

    const fetchClub = async () => {
      try {

        // ==================================================
        // GET CLUB
        // ==================================================

        const clubsResponse =
          await fetch("/api/clubs");

        if (!clubsResponse.ok) {
          throw new Error(
            "Failed to load clubs"
          );
        }

        const clubs: Club[] =
          await clubsResponse.json();

        const selectedClub =
          clubs.find(
            (club) =>
              club.clubId ===
              parsedClubId
          );

        if (!selectedClub) {
          throw new Error(
            "Club not found"
          );
        }

        setClub(selectedClub);


        // ==================================================
        // GET TEAMS
        // ==================================================

        const teamsResponse =
          await fetch(
            `/api/teams?clubId=${parsedClubId}`
          );

        if (!teamsResponse.ok) {
          throw new Error(
            "Failed to load teams"
          );
        }

        const teamsData =
          await teamsResponse.json();

        const clubTeams: Team[] =
          teamsData.map(
            (team: any) => ({
              teamId:
                team.team_id,

              clubId:
                team.club_id,

              name:
                team.name,

              club:
                team.club,
            })
          );

        setTeams(clubTeams);


        // ==================================================
        // GET ATHLETES
        // ==================================================

        const athletesResponse =
          await fetch(
            `/api/athlete?clubId=${parsedClubId}`
          );

        if (!athletesResponse.ok) {
          throw new Error(
            "Failed to load athletes"
          );
        }

        const athletesData =
          await athletesResponse.json();

        const clubAthletes: Athlete[] =
          athletesData.map(
            (athlete: any) => ({
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
                athlete.team_memberships ?? [],
            })
          );

        setAthletes(
          clubAthletes
        );


        // ==================================================
        // GET SESSIONS
        // ==================================================

        const sessionsResponse =
          await fetch(
            `/api/session?clubId=${parsedClubId}`
          );

        if (!sessionsResponse.ok) {
          throw new Error(
            "Failed to load sessions"
          );
        }

        const sessionsData =
          await sessionsResponse.json();

        console.log("Raw sessions data woo:", sessionsData);

        const clubSessions: Session[] =
          sessionsData.map(
            (session: any) => ({
              sessionId:
                session.session_id,

              sessionDay:
                session.session_day
                  ? new Date(
                      session.session_day
                    )
                      .toISOString()
                      .split("T")[0]
                  : "",

              startTime:
                session.start_time
                  ? session.start_time.slice(
                      0,
                      5
                    )
                  : "",

              endTime:
                session.end_time
                  ? session.end_time.slice(
                      0,
                      5
                    )
                  : "",

              location:
                session.location,

              discipline:
                session.discipline,

              snowConditions:
                session.snow_conditions,

              visConditions:
                session.vis_conditions,

              terrainType:
                session.terrain_type,

              numFreeskiRuns:
                session.num_freeski_runs,

              numDrillRuns:
                session.num_drill_runs,

              numEducationalCourseRuns:
                session.num_educational_course_runs,

              numGatesEducationalCourse:
                session.num_gates_educational_course,

              numRaceTrainingCourseRuns:
                session.num_race_training_course_runs,

              numGatesRaceTrainingCourse:
                session.num_gates_race_training_course,

              numRaceRuns:
                session.num_race_runs,

              numGatesRace:
                session.num_gates_race,

              generalComments:
                session.general_comments,

              teams:
                session.session_teams ?? [],
            })
          );

        setSessions(
          clubSessions
        );

      } catch (error) {

        console.error(
          "Failed to load club:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

    fetchClub();

  }, [clubId]);


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return <p>Loading club...</p>;
  }


  // CLUB NOT FOUND
  
  if (!club) {
    return <p>Club not found.</p>;
  }

  return (
    <div className="light-blue-box">
      <div className="light-tan-box">
        <div className="club-dashboard">

          <h2>{club.name}</h2>

          <div
            className="generate-invite-butt"
            id="coach-invite"
          >
            <div className="generate-invite-box">

              <h3>Invite a Coach</h3>

              <GenerateInviteButton
                role="coach"
              />

            </div>
          </div>

          <div className="teams-box">
            <h3>Teams</h3>
            {teams.length === 0 ? (

              <p>
                This club does not have any teams.
              </p>

            ) : (

              <div className="team-list">

                {teams.map((team) => (

                  <button
                    key={team.teamId}
                    className="main-button"
                    onClick={() =>
                      navigate(
                        `/team/${team.teamId}`
                      )
                    }
                  >
                    {team.name}
                  </button>

                ))}

              </div>

            )}
          </div>

          <div className="three-column-dash">
            <div>
              <h3 className="box-h3-title">Athletes</h3>
              <div className="white-box">
                <MiniAthletesList
                  athletes={athletes}
                />
              </div>
            </div>

            <div>
              <h3 className="box-h3-title">Sessions</h3>
              <div className="white-box">
                <MiniSessionsList
                  sessions={sessions}
                />
              </div>
            </div>

            <div id="pie-chart-div">
              {/* <h3>Analysis</h3> */}
                <PieChart selection="sessions"  clubId={Number(clubId)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDashboard;
