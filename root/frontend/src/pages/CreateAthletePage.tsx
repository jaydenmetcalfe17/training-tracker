// pages/CreateAthletePage.tsx
import { useState } from 'react';
import type { Athlete } from '../types/Athlete';
import AthletesList from '../components/AthletesList';
import CreateAthleteForm from '../components/CreateAthleteForm';

const CreateAthletePage: React.FC = () => {
    const [athletes, setAthletes] = useState<Athlete[]>([]);

    // Create Athlete Profile
	const createAthleteProfile = (newAthlete: Athlete) => {
        
        fetch('/api/athlete', {
		// fetch('http://localhost:3000/api/athlete', { 
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
    <div>
      <h1>Create Athlete</h1>
      <CreateAthleteForm onSubmit={createAthleteProfile} />
      <AthletesList athletes={athletes} />
    </div>
  );
}

export default CreateAthletePage