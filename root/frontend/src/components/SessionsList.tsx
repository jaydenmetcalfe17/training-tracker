// components/AthleteList.tsx
import type { Session } from "../types/Session";
import Table from "./Table";

interface SessionListProps {
  sessions: Session[];
};


const SessionsList: React.FC<SessionListProps> = ({ sessions }) => {
  return (
    <div>
      <h2>All Sessions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Discipline</th>
            <th>Snow Conditions</th>
            <th>Visibility Conditions</th>
            <th>Terrain Type</th>
            <th># of Drill Runs</th>
            <th># of Freeski Runs</th>
            <th># of Course Runs</th>
            {/* <th>Athletes</th>   ------ only have this for coach dashboard*/} 
            <th>General Comments</th>
          </tr>
        </thead>
        
        <tbody>
          {sessions.map((session, index) => (
            <tr key={index}>
              <td>{session.sessionDay}</td>
              <td>{session.location}</td>
              <td>{session.discipline}</td>
              <td>{session.snowConditions}</td>
              <td>{session.visConditions}</td>
              <td>{session.terrainType}</td>
              <td>{session.numDrillRuns}</td>
              <td>{session.numFreeskiRuns}</td>
              <td>{session.numCourseRuns}</td>
              <td>{session.generalComments}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default SessionsList