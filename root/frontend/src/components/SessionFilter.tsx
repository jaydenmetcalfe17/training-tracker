// import './AthletesSessions.scss';
import { useEffect, useState } from "react";
import type { Session } from '../types/Session';
import SessionsList from './SessionsList/SessionsList';
import type { Athlete } from '../types/Athlete';

interface FilterSessionsProps {
  athlete?: Athlete | null;
}

const SessionFilter: React.FC<FilterSessionsProps>= ( {athlete} ) => {
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    location: "",
    discipline: "",
    snowConditions: "",
    visConditions: "",
    terrainType: "",
  });

  const [usedFilters, setUsedFilters] = useState({
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
      
      console.log("WOOHOO");
      const params = new URLSearchParams();

      if (athlete?.athleteId) {
        params.append("athleteId", athlete.athleteId.toString());
      }

      Object.entries(usedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

    //   if (filters.startDate) params.append("startDate", filters.startDate);
    //   if (filters.endDate) params.append("endDate", filters.endDate);
    //   if (filters.location) params.append("location", filters.location);
    //   if (filters.discipline) params.append("discipline", filters.discipline);
    //   if (filters.snowConditions) params.append("snowConditions", filters.snowConditions);
    //   if (filters.visConditions) params.append("visConditions", filters.visConditions);
    //   if (filters.terrainType) params.append("terrainType", filters.terrainType);

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
            startTime: session.startTime,
            endTime: session.endTime,
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
          }));

          setFilteredSessions(mappedSessions);
          console.log("Sessions found: ", mappedSessions);
        })

        .catch((err) => console.log("Unable to find sessions: ", err));
  }, [usedFilters, athlete]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsedFilters(filters);
  };
  


  return (
    <div className="light-blue-box">
        <div className="search-sessions-list-box">
            <form onSubmit={handleSubmit}>
                <label>Start Date: </label>
                    <input 
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleChange}/> 

                <label>End Date: </label>
                    <input 
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleChange}/> 
                

                <label>Location: </label>
                    <input 
                        type="text"
                        name="location"
                        value={filters.location}
                        onChange={handleChange}/> 

                <label>Discipline: </label>
                    <input 
                        type="text"
                        name="discipline"
                        value={filters.discipline}
                        onChange={handleChange}/> 
                

                <label>Snow Conditions: </label>
                    <input 
                        type="text"
                        name="snowConditions"
                        value={filters.snowConditions}
                        onChange={handleChange}/> 

                <label>Visibility Conditions: </label>
                    <input 
                        type="text"
                        name="visConditions"
                        value={filters.visConditions}
                        onChange={handleChange}/> 

                <label>Terrain Type: </label>
                    <input 
                        type="text"
                        name="terrainType"
                        value={filters.terrainType}
                        onChange={handleChange}/> 
                <button type="submit">Apply Filters</button>
            </form>
        </div>
      <SessionsList sessions={filteredSessions} />
      </div>
  );
};

export default SessionFilter;