import './AthletesSessions.scss';
import { useEffect, useState } from "react";
import type { Athlete } from "../../types/Athlete";
import type { Session } from "../../types/Session";
import SessionsList from "../SessionsList/SessionsList";
import EditAthleteForm from '../EditAthleteForm';

interface AthletesProps {
  athlete: Athlete | null;
}

const AthletesSessions: React.FC<AthletesProps> = ({ athlete }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "",
    discipline: "",
    snowConditions: "",
    visConditions: "",
    terrainType: "",
  });

  // command for getting all sessions that an athlete attended

  useEffect(() => {
    console.log("Athletesessions athlete: ", athlete);
    if (athlete?.athleteId) {
      console.log("WOOHOO");
      const params = new URLSearchParams();
      params.append("athleteId", athlete.athleteId.toString());

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.location) params.append("location", filters.location);
      if (filters.discipline) params.append("discipline", filters.discipline);
      if (filters.snowConditions) params.append("snowConditions", filters.snowConditions);
      if (filters.visConditions) params.append("visConditions", filters.visConditions);
      if (filters.terrainType) params.append("terrainType", filters.terrainType);

      fetch(`/api/session?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to find sessions");
          }
          return res.json();
        })
        .then((data) => {
          const mappedSessions: Session[] = data.map((session: any) => ({
            sessionId: session.session_id,
            sessionDay: new Date(session.session_day)
              .toISOString()
              .split("T")[0],
            location: session.location,
            discipline: session.discipline,
            snowConditions: session.snow_conditions, // watch casing from DB!
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
          }));

          setSessions(mappedSessions);
          console.log("Sessions found: ", mappedSessions);
        })

        .catch((err) => console.log("Unable to find sessions: ", err));
    }
  }, [athlete, filters]);

  //edit/update athlete profile info
  const [showPopup, setShowPopup] = useState(false);
  const toggleEditPopup = () => {
    setShowPopup(!showPopup);
  };

  const editAthleteProfile = (updatedAthlete: Athlete) => {
    console.log("updated: ", updatedAthlete);
      if (!updatedAthlete) return; 
      if (!athlete) return;  

      fetch(`/api/athlete/${athlete.athleteId}`, {
		// fetch('http://localhost:3000/api/athlete', {    // for when the vite.config.ts file is not redirecting to localhost:3000
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(updatedAthlete),
		  })
		  .then((res) => res.json())
      .then((data) => {
          console.log('Athlete updated:', data);
      })
      .catch((err) => console.error('Failed to update athlete profile', err));

      toggleEditPopup();
  };


  return (
    <div className="light-blue-box">
      <div className="athlete-sessions-box">
        { 
          (athlete != null)
            ? <>
                <h2 className="athlete-name">{athlete.athleteFirstName.toUpperCase()} {athlete.athleteLastName.toUpperCase()}</h2>
                <h3>Birthday: {athlete.birthday.split("T")[0]}</h3>
                <h3>Age Group: {athlete.ageGroup}</h3>
                <h3>Team: {athlete.team}</h3>
              </>
            : <h2 className="athlete-name">SESSIONS</h2>
        }
        <div>
          <button className="edit-athlete-button" onClick={toggleEditPopup}>Edit Athlete</button>
          {showPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <EditAthleteForm athlete={athlete} onSubmit={editAthleteProfile}/>
                {/* <button onClick={toggleEditPopup}>Edit Athlete</button> */}
              </div>
            </div>
          )}
        </div>
          {/* FILTER FORM --- TURN INTO A COMPONENT OR SOMETHING LATER!!!! */}
        <div className="search-sessions-list-box">
            <form onSubmit={(e) => {
                    e.preventDefault();
                }}
            >
                <label>
                    Start Date: 
                    <input 
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                            setFilters({ ...filters, startDate: e.target.value })
                        }
                    /> 
                </label>

                <label>
                    End Date: 
                    <input 
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                            setFilters({ ...filters, endDate: e.target.value })
                        }
                    /> 
                </label>

                <label>
                    Location: 
                    <input 
                        type="text"
                        value={filters.location}
                        onChange={(e) =>
                            setFilters({ ...filters, location: e.target.value })
                        }
                    /> 
                </label>

                <label>
                    Discipline: 
                    <input 
                        type="text"
                        value={filters.discipline}
                        onChange={(e) =>
                            setFilters({ ...filters, discipline: e.target.value })
                        }
                    /> 
                </label>

                <label>
                    Snow Conditions: 
                    <input 
                        type="text"
                        value={filters.snowConditions}
                        onChange={(e) =>
                            setFilters({ ...filters, snowConditions: e.target.value })
                        }
                    /> 
                </label>

                <label>
                    Visibility Conditions: 
                    <input 
                        type="text"
                        value={filters.visConditions}
                        onChange={(e) =>
                            setFilters({ ...filters, visConditions: e.target.value })
                        }
                    /> 
                </label>

                <label>
                    Terrain Type: 
                    <input 
                        type="text"
                        value={filters.terrainType}
                        onChange={(e) =>
                            setFilters({ ...filters, terrainType: e.target.value })
                        }
                    /> 
                </label>
                <button type="submit">Apply Filters</button>
            </form>

          <SessionsList sessions={sessions} />
        </div>
      </div>
    </div>
  );
};

export default AthletesSessions;
