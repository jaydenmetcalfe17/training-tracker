// components/AthleteList.tsx
import type { Session } from "../types/Session";

interface SessionListProps {
  sessions: Session[];
};


const SessionsList: React.FC<SessionListProps> = ({ sessions }) => {
  return (
    <div>
      <h2>All Sessions</h2>
      <ul>
        {sessions.map((session, index) => (
          <li key={index}>
            {session.sessionDay}: {session.location} - {session.discipline}, {session.generalComments} 
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionsList