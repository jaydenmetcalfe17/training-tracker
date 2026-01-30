// components/AthleteList.tsx
import "./AthletesList.scss"
import type { Athlete } from "../../types/Athlete";
import { useNavigate } from "react-router-dom";
import SortableTable from "../SortableTable/SortableTable";
// import Table from "../Table";

interface AthleteListProps {
  athletes: Athlete[];
}


const AthletesList: React.FC<AthleteListProps> = ({ athletes }) => {

  const navigate = useNavigate();

  const headers: { key: keyof Athlete; label: string }[] = [
      {key: "athleteFirstName", label: "First Name"},
      {key: "athleteLastName", label: "Last Name"},
      {key: "birthday", label: "Birthday"},
      {key: "gender", label: "Gender"},
      {key: "team", label: "Team"},
      {key: "ageGroup", label: "Age Group"},
    ];


  return (
    <SortableTable<Athlete> headers={headers} data={athletes} onRowClick={(athlete) => navigate(`/athlete/${athlete.athleteId}`)} />
  );
};

export default AthletesList