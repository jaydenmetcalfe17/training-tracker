import { useEffect, useState } from "react";
import type { Athlete } from "../types/Athlete";
import type { Session } from "../types/Session";
import SessionsList from "./SessionsList";



interface AthletesProps {
  athlete: Athlete | null;
}

const AthletesSessions: React.FC<AthletesProps> = ({ athlete }) => {

  
    const [sessions, setSessions] = useState<Session[]>([]);

    // command for getting all sessions that an athlete attended

    useEffect(() => {
        console.log("Athletesessions athlete: ", athlete);
        if (athlete?.athleteId) {
          fetch(`/api/session?athleteId=${athlete.athleteId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }) 
            .then((res) => {
              if (!res.ok) {
                throw new Error('Failed to find sessions');
              }
              return res.json();
            })
            .then((data) => {
                const mappedSessions: Session[] = data.map((session: any) => ({
                    sessionId: session.session_id,
                    sessionDay: new Date(session.session_day).toISOString().split('T')[0],
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
                console.log('Sessions found: ', mappedSessions);
            })
            
            .catch((err) => console.log('Unable to find sessions: ', err));
        }
      }, [athlete]);
    

    return (
        <>
            Athlete's Sessions
            <SessionsList sessions={sessions} />
        </>
    )
}

export default AthletesSessions