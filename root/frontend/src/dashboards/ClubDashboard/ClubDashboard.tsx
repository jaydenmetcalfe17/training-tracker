// dashboards/ClubDashboard/ClubDashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Team } from "../../types/Team";
import type { Athlete } from "../../types/Athlete";
import type { Session } from "../../types/Session";

import PieChart from "../../components/PieChart/PieChart";
import MiniAthletesList from "../../components/MiniAthletesList/MiniAthletesList";
import MiniSessionsList from "../../components/MiniSessionsList/MiniSessionsList";

import "./ClubDashboard.scss";

interface Club {
  clubId: number;
  name: string;
}

function mapTeam(team: any): Team {
  return {
    teamId: team.team_id,
    clubId: team.club_id,
    name: team.name,
    club: team.club,
  };
}

function mapAthlete(athlete: any): Athlete {
  return {
    athleteId: athlete.athlete_id,
    athleteFirstName: athlete.athlete_first_name,
    athleteLastName: athlete.athlete_last_name,
    birthday: athlete.birthday,
    gender: athlete.gender,
    acaId: athlete.aca_id,
    fisId: athlete.fis_id,
    ageGroup: athlete.age_group,
    teamMemberships: athlete.team_memberships ?? [],
  };
}

function mapSession(session: any): Session {
  return {
    sessionId: session.session_id,
    sessionDay: session.session_day
      ? new Date(session.session_day).toISOString().split("T")[0]
      : "",
    startTime: session.start_time ? session.start_time.slice(0, 5) : "",
    endTime: session.end_time ? session.end_time.slice(0, 5) : "",
    location: session.location,
    discipline: session.discipline,
    snowConditions: session.snow_conditions,
    visConditions: session.vis_conditions,
    terrainType: session.terrain_type,
    numFreeskiRuns: session.num_freeski_runs,
    numDrillRuns: session.num_drill_runs,
    numEducationalCourseRuns: session.num_educational_course_runs,
    numGatesEducationalCourse: session.num_gates_educational_course,
    numRaceTrainingCourseRuns: session.num_race_training_course_runs,
    numGatesRaceTrainingCourse: session.num_gates_race_training_course,
    numRaceRuns: session.num_race_runs,
    numGatesRace: session.num_gates_race,
    generalComments: session.general_comments,
    teams: (session.teams ?? []).map((team: any) => ({
      teamId: team.teamId,
      clubId: team.clubId,
      name: team.teamName,
    })),
  };
}

async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`${errorMessage}: ${res.status}`);
  }

  return res.json();
}

const ClubDashboard: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
      return;
    }

    const parsedClubId = Number(clubId);

    if (!Number.isInteger(parsedClubId)) {
      console.error("Invalid club ID:", clubId);
      setLoading(false);
      return;
    }

    const fetchClub = async () => {
      try {

        // ==================================================
        // GET CLUB
        // ==================================================

        const clubs = await fetchJson<Club[]>(
          "/api/clubs",
          "Failed to load clubs"
        );

        const selectedClub = clubs.find(
          (club) => club.clubId === parsedClubId
        );

        if (!selectedClub) {
          throw new Error("Club not found");
        }

        setClub(selectedClub);

        // ==================================================
        // GET TEAMS / ATHLETES / SESSIONS
        // ==================================================
        //
        // These are independent of each other, and an empty or
        // failing result for one (e.g. a club with zero athletes)
        // should not prevent the others from rendering - so each
        // is handled individually instead of via Promise.all.

        const [teamsResult, athletesResult, sessionsResult] =
          await Promise.allSettled([
            fetchJson<any[]>(
              `/api/teams?clubId=${parsedClubId}`,
              "Failed to load teams"
            ),
            fetchJson<any[]>(
              `/api/athlete?clubId=${parsedClubId}`,
              "Failed to load athletes"
            ),
            fetchJson<any[]>(
              `/api/session?clubId=${parsedClubId}`,
              "Failed to load sessions"
            ),
          ]);

        if (teamsResult.status === "fulfilled") {
          setTeams(teamsResult.value.map(mapTeam));
        } else {
          console.error(teamsResult.reason);
        }

        if (athletesResult.status === "fulfilled") {
          setAthletes(athletesResult.value.map(mapAthlete));
        } else {
          console.error(athletesResult.reason);
        }

        if (sessionsResult.status === "fulfilled") {
          console.log("Raw sessions data woo:", sessionsResult.value);
          setSessions(sessionsResult.value.map(mapSession));
        } else {
          console.error(sessionsResult.reason);
        }

      } catch (error) {

        console.error("Failed to load club:", error);

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
