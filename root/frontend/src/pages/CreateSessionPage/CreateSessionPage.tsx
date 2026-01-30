// pages/CreateSessionPage.tsx

import "./CreateSessionPage.scss";
import { useEffect, useState } from 'react';
import type { Session } from '../../types/Session';
// import SessionsList from '../../components/SessionsList/SessionsList';
import CreateSessionForm from '../../components/CreateSessionForm/CreateSessionForm';
import PartialSessionsList from "../../components/PartialSessionsList";
import PieChart from "../../components/PieChart";

const CreateSessionPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);


    useEffect(() => {
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
            setSessions([...sessions, ...loadedSessions]);
            console.log("Sessions found: ", loadedSessions);
          })
  
          .catch((err) => console.log("Unable to find sessions: ", err));

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

            window.location.reload();
        })
        .catch((err) => console.error('Failed to create session', err));
  };



  return (
    <div className="create-session-page">
      <div className="upper-sessions-box">
        <div className= "cr-form">
          <CreateSessionForm onSubmit={createSession} />
        </div>
        <div className="light-tan-box" id="pie-chart">
          <PieChart selection={"sessions"}/>
        </div>
      </div>
      
      <PartialSessionsList sessions={sessions} />
    </div>
  );
}

export default CreateSessionPage