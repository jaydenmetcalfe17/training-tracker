// pages/CreateAthletePage.tsx

import "./CreateAthletePage.scss";
import { useEffect, useState } from 'react';
import type { Athlete } from '../../types/Athlete';
import AthletesList from '../../components/AthletesList/AthletesList';
import CreateAthleteForm from '../../components/CreateAthleteForm';

const CreateAthletePage: React.FC = () => {
    const [athletes, setAthletes] = useState<Athlete[]>([]);

    useEffect(() => { 
        fetch(`/api/athlete`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }) 
            .then((res) => {
              if (!res.ok) {
                throw new Error('Failed to load athletes');
              }
              return res.json();
            })
           .then((data) => {
              console.log("ATHLETE DATA: ", data);
              const loadedAthletes: Athlete[] = data.map((athlete: any) => ({
                  athleteId: athlete.athlete_id,
                  athleteFirstName: athlete.athlete_first_name,
                  athleteLastName: athlete.athlete_last_name,
                  birthday: new Date(athlete.birthday)
                    .toISOString()
                    .split("T")[0],
                  gender: athlete.gender
              }));
              setAthletes([...athletes, ...loadedAthletes]);
            })
            .catch((err) => console.log('Unable to find athletes: ', err));
    }, []);
      


    // Create Athlete Profile
	  const createAthleteProfile = (newAthlete: Athlete) => {
        
        fetch('/api/athlete', {
		// fetch('http://localhost:3000/api/athlete', {    // for when the vite.config.ts file is not redirecting to localhost:3000
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newAthlete),
		  })
		  .then((res) => res.json())
      .then((data) => {
          console.log('Athlete created:', data);
          setAthletes([...athletes, newAthlete]);
      })
      .catch((err) => console.error('Failed to create athlete', err));
  };

  return (
    <div className="create-athlete-page">
      <CreateAthleteForm onSubmit={createAthleteProfile} />
      <AthletesList athletes={athletes} />
    </div>
  );
}

export default CreateAthletePage