// components/AthleteList.tsx
import "./SessionsList.scss";
import type { Session } from "../../types/Session";
import SortableTable from "../SortableTable/SortableTable";
import { useNavigate } from "react-router-dom";

interface SessionListProps {
  sessions: Session[];
};

const SessionsList: React.FC<SessionListProps> = ({ sessions }) => { 
  console.log("found sessions: ", sessions);

  const navigate = useNavigate();

  const headers: { key: keyof Session; label: string }[] = [
    {key: "sessionDay", label: "Date"},
    {key: "startTime", label: "Start Time"},
    {key: "endTime", label: "End Time"},
    {key: "location", label: "Location"},
    {key: "discipline", label: "Discipline"},
    {key: "snowConditions", label: "Snow Conditions"},
    {key: "visConditions", label: "Visibility Conditions"},
    {key: "terrainType", label: "Terrain Type"},
    {key: "numDrillRuns", label: "# of Drill Runs"},
    {key: "numFreeskiRuns", label: "# of Freeski Runs"},
    {key: "numEducationalCourseRuns", label: "# of Educational Course Runs"},
    {key: "numGatesEducationalCourse", label: "# of Gates in Educational Course"},
    {key: "numRaceTrainingCourseRuns", label: "# of Training Course Runs"},
    {key: "numGatesRaceTrainingCourse", label: "# of Gates in Training Course"},
    {key: "numRaceRuns", label: "# of Race Runs"},
    {key: "numGatesRace", label: "# of Gates in Race"},
    {key: "generalComments", label: "General Comments"},
  ];

  return (
    <div>
      <SortableTable<Session> headers={headers} data={sessions} onRowClick={(session) => navigate(`/session/${session.sessionId}`)} />
    </div>
  );
};

export default SessionsList

