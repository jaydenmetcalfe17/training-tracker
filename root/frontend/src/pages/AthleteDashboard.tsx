import AthletesSessions from "../components/AthletesSessions/AthletesSessions"
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import type { Athlete } from "../types/Athlete";
import { useNavigate, useParams } from "react-router-dom";


const AthleteDashboard: React.FC = () => {
  const navigate = useNavigate();
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

  // delete athlete 
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const toggleDeletePopup = () => {
      setShowDeletePopup(!showDeletePopup);
    };

    const deleteAthlete = () => {
        if (!athlete) return;  
  
        fetch(`/api/athlete/${athlete.athleteId}`, {
      // fetch('http://localhost:3000/api/athlete', {    // for when the vite.config.ts file is not redirecting to localhost:3000
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(athlete),
        })
        .then((res) => res.json())
        .then((data) => {
            console.log('Athlete deleted:', data);
        })
        .catch((err) => console.error('Failed to delete athlete', err));
        
        navigate(`/dashboard`);
    };


  const handleClick = () => {
    navigate(`/dashboard`);
  };


  return (
    <div>
      <div>
        <button className="back-button" onClick={() => handleClick()}>Back to Dashboard</button> {/* make this only for coach POV */}
      </div>
      <div>
        <button className="delete-button" onClick={toggleDeletePopup}>Delete Athlete</button>
          {showDeletePopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h3>Are you sure you want to delete this athlete?</h3>
                <button onClick={deleteAthlete}>Yes, delete the athlete</button>
                <button onClick={toggleDeletePopup}>No, keep the athlete</button>
              </div>
            </div>
          )}
      </div>
      <AthletesSessions athlete = {athlete}/>
    </div>
  )
}

export default AthleteDashboard