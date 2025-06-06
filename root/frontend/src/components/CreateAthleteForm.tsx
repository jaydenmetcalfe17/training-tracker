// components/AthleteForm.tsx

import { useState } from 'react';
import type { Athlete } from "../types/Athlete";

interface AthleteFormProps {
  onSubmit: (athlete: Athlete) => void;
}

const CreateAthleteForm: React.FC<AthleteFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<Athlete>({
        athleteFirstName: '',
        athleteLastName: '',
        birthday: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ athleteFirstName: '', athleteLastName: '', birthday: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
        <input name="athleteFirstName" placeholder="First Name" value={formData.athleteFirstName} onChange={handleChange}/>
        <input name="athleteLastName" placeholder="Last Name" value={formData.athleteLastName} onChange={handleChange}/>
        <input name="birthday" placeholder=" Birthday (YYYY-MM-DD)" value={formData.birthday} onChange={handleChange}/>
        <button type="submit">Create Athlete Profile</button>
    </form>
  );

};



export default CreateAthleteForm