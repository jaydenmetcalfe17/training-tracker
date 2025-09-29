import { useEffect, useState } from "react";
import type { Athlete } from "../types/Athlete";
import type { Session } from "../types/Session";
import SessionsList from "./SessionsList";

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
            snowConditions: session.snowconditions, // watch casing from DB!
            visConditions: session.visconditions,
            terrainType: session.terraintype,
            numFreeskiRuns: session.numfreeskiruns,
            numDrillRuns: session.numdrillruns,
            numCourseRuns: session.numcourseruns,
            generalComments: session.generalcomments,
          }));

          setSessions(mappedSessions);
          console.log("Sessions found: ", mappedSessions);
        })

        .catch((err) => console.log("Unable to find sessions: ", err));
    }
  }, [athlete, filters]);

  return (
    <>
      Athlete's Sessions
        {/* FILTER FORM --- TURN INTO A COMPONENT OR SOMETHING LATER!!!! */}
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
    </>
  );
};

export default AthletesSessions;
