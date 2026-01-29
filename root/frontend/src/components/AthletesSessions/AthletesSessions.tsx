import './AthletesSessions.scss';
import type { Athlete } from "../../types/Athlete";
import SessionFilter from '../SessionFilter';
import PieChart from '../PieChart';

interface AthletesProps {
  athlete: Athlete | null;
}

const AthletesSessions: React.FC<AthletesProps> = ({ athlete }) => {


  return (
    <div className="light-blue-box">
      <div className="athlete-sessions-box">
        { 
          (athlete != null)
            ? <>
                <h2 className="athlete-name">{athlete.athleteFirstName.toUpperCase()} {athlete.athleteLastName.toUpperCase()}</h2>
                <h3>Birthday: {athlete.birthday.split("T")[0]}</h3>
                <h3>Age Group: {athlete.ageGroup}</h3>
                <h3>Team: {athlete.team}</h3>
              </>
            : <h2 className="athlete-name">SESSIONS</h2>
        }
          <SessionFilter athlete={athlete} />
          <div className="pie-chart">
            <PieChart selection={"sessions"} athleteId={athlete?.athleteId}/>
          </div>
        </div>
      </div>
  );
};

export default AthletesSessions;
