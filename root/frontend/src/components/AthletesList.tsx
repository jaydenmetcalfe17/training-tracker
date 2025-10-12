// components/AthleteList.tsx
import type { Athlete } from "../types/Athlete";
import { useNavigate } from "react-router-dom";
import Table from "./Table";

interface AthleteListProps {
  athletes: Athlete[];
}


const AthletesList: React.FC<AthleteListProps> = ({ athletes }) => {

  const navigate = useNavigate();

  const handleRowClick = (athleteId: number | undefined) => {
    navigate(`/athlete/${athleteId}`);
  };




  return (
    <div>
      <h2>All Athletes</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Birthday</th>
            <th>Gender</th>
          </tr>
        </thead>
        
        <tbody>
          {athletes.map((athlete, index) => (
            <tr key={index} onClick={() => handleRowClick(athlete.athleteId)}>
              <td>{athlete.athleteFirstName}</td>
              <td>{athlete.athleteLastName}</td>
              <td>{athlete.birthday}</td>
              <td>{athlete.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AthletesList