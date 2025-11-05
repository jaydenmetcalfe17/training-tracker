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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // input validation 
      let isValid = true;
      let errorMessage = "";

      if (e.target.name == "gender") {
        const allowedGenders = ["Male", "Female"];
        if (!allowedGenders.includes(e.target.value)) { // if invalid input
          isValid = false;
          errorMessage = "Please enter Male or Female.";
        }
      } else if (e.target.name == "ageGroup") {
          const allowedAgeGroups = ["U10", "U12", "U14", "U16", "FIS"];
          if (!allowedAgeGroups.includes(e.target.value)) { // if invalid input
            isValid = false;
            errorMessage = "Please enter a valid age group."
        }
      // } else if (e.target.name == "team") {
      }
      setErrors((prev) => ({ ...prev, [e.target.name]: errorMessage }));

      if (isValid = true) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      } else {
        console.error("Invalid input. Please try again.");
      }
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
            <input type="text" required name="athleteFirstName" value={formData.athleteFirstName} onChange={handleChange}/>
            <label>Last Name: </label>
            <input type="text" required name="athleteLastName" value={formData.athleteLastName} onChange={handleChange}/>
            <label>Birthday: </label>
            <input required name="birthday" type="date" placeholder="Birthday (YYYY-MM-DD)" value={formData.birthday} onChange={handleChange}/>
            <label>Gender: </label>
            <input type="text" required name="gender" list="gender" value={formData.gender} onChange={handleChange}/>
            <datalist id="gender">
                <option value="Male"></option>
                <option value="Female"></option>
            </datalist>
            {errors.gender && <p className="error-text">{errors.gender}</p>}
            <label>Team: </label>
            <input type="text" name="team" list="team" value={formData.team} onChange={handleChange}/>
            <datalist id="team">
                <option value="Whistler Mountain Ski Club"></option>
              </datalist>
            <label>Age Group: </label>
            <input type="text" required name="ageGroup" list="ageGroup" value={formData.ageGroup} onChange={handleChange}/>
            <datalist id="ageGroup">
                <option value="U10"></option>
                <option value="U12"></option>
                <option value="U14"></option>
                <option value="U16"></option>
                <option value="FIS"></option>
              </datalist>
              {errors.ageGroup && <p className="error-text">{errors.ageGroup}</p>}
            <button type="submit">Create Athlete Profile</button>
          </form>
        </div>
      </div>
    </div>
  );

};



export default CreateAthleteForm