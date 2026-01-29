// components/AthleteList.tsx
// import "./SessionsList.scss";
import type { Session } from "../types/Session";
import { useNavigate } from "react-router-dom";
import SortableTable from "./SortableTable";
// import Table from "../Table";

interface SessionListProps {
  sessions: Session[];
};


const SessionsList: React.FC<SessionListProps> = ({ sessions }) => {
  console.log("found sessions: ", sessions);

  const navigate = useNavigate();

   const headers: { key: keyof Session; label: string }[] = [
    {key: "sessionDay", label: "Date"},
    {key: "location", label: "Location"},
    {key: "discipline", label: "Discipline"},
    {key: "snowConditions", label: "Snow Conditions"},
    {key: "visConditions", label: "Visibility Conditions"},
    {key: "terrainType", label: "Terrain Type"},
    {key: "generalComments", label: "General Comments"},
  ];

  return (
    <SortableTable<Session> headers={headers} data={sessions} onRowClick={(session) => navigate(`/session/${session.sessionId}`)} />
  );
};

export default SessionsList