// components/AthleteList.tsx
// import "./SessionsList.scss";
import type { Session } from "../types/Session";
import { useNavigate } from "react-router-dom";
// import Table from "../Table";

interface SessionListProps {
  sessions: Session[];
};


const SessionsList: React.FC<SessionListProps> = ({ sessions }) => {
  console.log("found sessions: ", sessions);

  const navigate = useNavigate();

  const handleRowClick = (sessionId: number | undefined) => {
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="sessions-list-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">All Sessions</h2>
        <div className="white-box" id="sessions-white-box">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Location</th>
                <th>Discipline</th>
                <th>Snow Conditions</th>
                <th>Visibility Conditions</th>
                <th>Terrain Type</th>
                <th>General Comments</th>
                {/* coaches present */}
              </tr>
            </thead>
            
            <tbody>
              {sessions.map((session, index) => (
                <tr key={index} onClick={() => handleRowClick(session.sessionId)}>
                  <td>{session.sessionDay}</td>
                  <td>{session.location}</td>
                  <td>{session.discipline}</td>
                  <td>{session.snowConditions}</td>
                  <td>{session.visConditions}</td>
                  <td>{session.terrainType}</td>
                  <td>{session.generalComments}</td>
                </tr>
              ))}
            </tbody>

          </table>
         </div>
      </div>
    </div>
  );
};

export default SessionsList