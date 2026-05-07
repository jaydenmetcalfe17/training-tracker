// pages/AthleteDashboard.tsx

import AthletesSessions from "../../components/AthletesSessions/AthletesSessions"
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import type { Athlete } from "../../types/Athlete";
import { useNavigate, useParams } from "react-router-dom";

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';


import "./AthleteDashboard.scss";


const AthleteDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const params = useParams()

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const isVisible = (user?.status === 'coach');


  useEffect(() => {
    let insert = ''
    if (user?.status == 'coach') {
      insert = `athleteId=${params.athleteId}`
    } else if (user?.status == 'athlete' || user?.status == 'parent')  {
      console.log("IN HERE! athleteid: ", user?.athleteId, "this user is a: ", user?.status);
      insert = `athleteId=${user?.athleteId}`
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




  const handleClick = () => {
    navigate(`/dashboard`);
  };

  if (!athlete) return null;


  return (
    <div className="athlete-dashboard-wrapper">
      <div className="coach-only-buttons-box">
        <div>
          {isVisible && <button className="main-button" id="athlete-back-button" onClick={() => handleClick()}><KeyboardBackspaceIcon/></button> }
        </div>
      </div>
      <AthletesSessions athlete = {athlete}/>
    </div>
  )
}

export default AthleteDashboard