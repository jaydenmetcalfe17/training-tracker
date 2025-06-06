// components/AthleteList.tsx
import type { Athlete } from "../types/Athlete";

interface AthleteListProps {
  athletes: Athlete[];
};


const AthletesList: React.FC<AthleteListProps> = ({ athletes }) => {
  return (
    <div>
      <h2>All Athletes</h2>
      <ul>
        {athletes.map((athlete, index) => (
          <li key={index}>
            {athlete.athleteFirstName} {athlete.athleteLastName} - {athlete.birthday}    {/* athlete.birthday.toStringLocale() */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AthletesList