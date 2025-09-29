// pages/CreateSessionPage.tsx

import { useEffect, useState } from 'react';
import type { Session } from '../types/Session';
import SessionsList from '../components/SessionsList';
import CreateSessionForm from '../components/CreateSessionForm';

const CreateSessionPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  // const [filters, setFilters] = useState({
  //   startDate: "",
  //   endDate: "",
  //   location: "",
  //   discipline: "",
  //   snowConditions: "",
  //   visConditions: "",
  //   terrainType: "",
  // });


    useEffect(() => {
        // const params = new URLSearchParams();
  
        // if (filters.startDate) params.append("startDate", filters.startDate);
        // if (filters.endDate) params.append("endDate", filters.endDate);
        // if (filters.location) params.append("location", filters.location);
        // if (filters.discipline) params.append("discipline", filters.discipline);
        // if (filters.snowConditions) params.append("snowConditions", filters.snowConditions);
        // if (filters.visConditions) params.append("visConditions", filters.visConditions);
        // if (filters.terrainType) params.append("terrainType", filters.terrainType);
  
        // fetch(`/api/session?${params.toString()}`, {
        fetch(`/api/session`, {
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
            console.log("Sessions pre-mapping: ", data);
            const loadedSessions: Session[] = data.map((session: any) => ({
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
              numCourseRuns: session.num_course_runs,
              generalComments: session.general_comments,
            }));
            setSessions([...sessions, ...loadedSessions]);
            console.log("Sessions found: ", loadedSessions);
          })
  
          .catch((err) => console.log("Unable to find sessions: ", err));
    // }, [filters]);
    }, []);




    // Create Session
	const createSession = (newSession: Session) => {
        
        fetch('/api/session', {
		// fetch('http://localhost:3000/api/session', {    // for when the vite.config.ts file is not redirecting to localhost:3000
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newSession),
		})
		.then((res) => res.json())
        .then((data) => {
            console.log('Session created:', data);
            setSessions([...sessions, newSession]);
        })
        .catch((err) => console.error('Failed to create session', err));
  };



  return (
    <div>
      <h1>Create Session</h1>
      <CreateSessionForm onSubmit={createSession} />
      <SessionsList sessions={sessions} />
    </div>
  );
}

export default CreateSessionPage