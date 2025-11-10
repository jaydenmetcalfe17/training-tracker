// components/AthleteList.tsx
import "./SessionsList.scss";
import type { Session } from "../../types/Session";
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
        {/* <h2 className="box-h2-title">All Sessions</h2> */}
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
                <th># of Drill Runs</th>
                <th># of Freeski Runs</th>
                <th># of Educational Course Runs</th>
                <th># of Gates in Educational Course</th>
                <th># of Race Training Course Runs</th>
                <th># of Gates in Race Training Course</th>
                <th># of Race Runs</th>
                <th># of Gates in Race</th>
                {/* <th>Athletes</th>   ------ only have this for coach dashboard*/} 
                <th>General Comments</th>
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
                  <td>{session.numDrillRuns}</td>
                  <td>{session.numFreeskiRuns}</td>
                  <td>{session.numEducationalCourseRuns}</td>
                  <td>{session.numGatesEducationalCourse}</td>
                  <td>{session.numRaceTrainingCourseRuns}</td>
                  <td>{session.numGatesRaceTrainingCourse}</td>
                  <td>{session.numRaceRuns}</td>
                  <td>{session.numGatesRace}</td>
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