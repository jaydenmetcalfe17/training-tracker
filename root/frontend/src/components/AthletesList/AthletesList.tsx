// components/AthleteList.tsx
import "./AthletesList.scss"
import type { Athlete } from "../../types/Athlete";
import { useNavigate } from "react-router-dom";
// import Table from "../Table";

interface AthleteListProps {
  athletes: Athlete[];
}


const AthletesList: React.FC<AthleteListProps> = ({ athletes }) => {

  const navigate = useNavigate();

  const handleRowClick = (athleteId: number | undefined) => {
    navigate(`/athlete/${athleteId}`);
  };




  return (
    <div className = "athletes-list-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">All Athletes</h2>
        <div className="white-box" id="athletes-white-box">
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Birthday</th>
                <th>Gender</th>
                <th>Team</th>
                <th>Age Group</th>
              </tr>
            </thead>
            
            <tbody>
              {athletes.map((athlete, index) => (
                <tr key={index} onClick={() => handleRowClick(athlete.athleteId)}>
                  <td>{athlete.athleteFirstName}</td>
                  <td>{athlete.athleteLastName}</td>
                  <td>{athlete.birthday}</td>
                  <td>{athlete.gender}</td>
                  <td>{athlete.team}</td>
                  <td>{athlete.ageGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
         </div>
      </div>
    </div>
  );
};

export default AthletesList