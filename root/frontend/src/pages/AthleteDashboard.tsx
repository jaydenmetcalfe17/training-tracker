import AthletesSessions from "../components/AthletesSessions/AthletesSessions"
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import type { Athlete } from "../types/Athlete";
import { useParams } from "react-router-dom";


const AthleteDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const params = useParams()

  const [athlete, setAthlete] = useState<Athlete | null>(null);

  useEffect(() => {
    let insert = ''
    if (user?.status == 'coach') {
      insert = `athleteId=${params.athleteId}`
    } else if (user?.status == 'athlete') {
      insert = `userId=${user?.userId}`
    }

    fetch(`/api/athlete?${insert}`, {
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
            team: data[0].team,
            ageGroup: data[0].age_group,
          };
          setAthlete(mappedAthlete);
          console.log('Athlete found:', mappedAthlete);
      })
        .catch((err) => console.log('Unable to find athlete: ', err));
  }, [user]);


  return (
    <div>
      <AthletesSessions athlete = {athlete}/>
    </div>
  )
}

export default AthleteDashboard