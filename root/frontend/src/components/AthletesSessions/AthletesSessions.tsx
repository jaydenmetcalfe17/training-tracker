import './AthletesSessions.scss';
import type { Athlete } from "../../types/Athlete";
import SessionFilter from '../SessionFilter/SessionFilter';
// import PieChart from '../PieChart';

interface AthletesProps {
  athlete: Athlete | null;
}

const AthletesSessions: React.FC<AthletesProps> = ({ athlete }) => {


  return (
    <div className="light-blue-box">
      <div className="athlete-sessions-box">
          <SessionFilter athlete={athlete} />
        </div>
    </div>
  );
};

export default AthletesSessions;
