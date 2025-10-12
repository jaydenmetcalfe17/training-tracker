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
        gender: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ athleteFirstName: '', athleteLastName: '', birthday: '', gender: '' });
  };

  return (
    <div className="create-athlete-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">Create Athlete</h2>
        <div className="white-box">
          <form onSubmit={handleSubmit}>
            <label>First Name: </label>
            <input name="athleteFirstName" value={formData.athleteFirstName} onChange={handleChange}/>
            <label>Last Name: </label>
            <input name="athleteLastName" value={formData.athleteLastName} onChange={handleChange}/>
            <label>Birthday: </label>
            <input name="birthday" type="date" placeholder="Birthday (YYYY-MM-DD)" value={formData.birthday} onChange={handleChange}/>
            <label>Gender: </label>
            <input name="gender" list="gender" value={formData.gender} onChange={handleChange}/>
            <datalist id="gender">
                <option value="Male"></option>
                <option value="Female"></option>
              </datalist>
            <button type="submit">Create Athlete Profile</button>
          </form>
        </div>
      </div>
    </div>
  );

};



export default CreateAthleteForm