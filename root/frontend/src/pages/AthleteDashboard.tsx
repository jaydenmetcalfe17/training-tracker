import AthletesSessions from "../components/AthletesSessions"
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import type { Athlete } from "../types/Athlete";


const AthleteDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);

  const [athlete, setAthlete] = useState<Athlete | null>(null);

  useEffect(() => {
    if (user?.userId) {
      fetch(`/api/athlete?userId=${user.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }) 
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to find athlete');
          }
          return res.json();
        })
       .then((data) => {
          console.log("DATA: ", data);
          const mappedAthlete: Athlete = {
            athleteId: data[0].athlete_id,
            athleteFirstName: data[0].athlete_first_name,
            athleteLastName: data[0].athlete_last_name,
            birthday: data[0].birthday,
            gender: data[0].gender,
          };
          setAthlete(mappedAthlete);
          console.log('Athlete found:', mappedAthlete);
      })
        .catch((err) => console.log('Unable to find athlete: ', err));
    }
  }, [user]);


  return (
    <div>
      <AthletesSessions athlete = {athlete}/>
    </div>
  )
}

export default AthleteDashboard