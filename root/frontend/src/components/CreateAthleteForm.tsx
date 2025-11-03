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
        gender: '',
        team: '',
        ageGroup: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ athleteFirstName: '', athleteLastName: '', birthday: '', gender: '', team: '', ageGroup: ''});
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
            <label>Team: </label>
            <input name="team" list="team" value={formData.team} onChange={handleChange}/>
            <datalist id="team">
                <option value="Whistler Mountain Ski Club"></option>
              </datalist>
            <label>Age Group: </label>
            <input name="ageGroup" list="ageGroup" value={formData.ageGroup} onChange={handleChange}/>
            <datalist id="ageGroup">
                <option value="U10"></option>
                <option value="U12"></option>
                <option value="U14"></option>
                <option value="U16"></option>
                <option value="FIS"></option>
              </datalist>
            <button type="submit">Create Athlete Profile</button>
          </form>
        </div>
      </div>
    </div>
  );

};



export default CreateAthleteForm