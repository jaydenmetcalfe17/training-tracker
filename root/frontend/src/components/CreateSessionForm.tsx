// components/SessionForm.tsx

import { useEffect, useState } from 'react';
import type { Session } from "../types/Session";
import type { Athlete } from '../types/Athlete';
import MultiSelectEx from './Multiselect/Multiselect';


interface SessionFormProps {
  onSubmit: (session: Session) => void;
}

const CreateSessionForm: React.FC<SessionFormProps> = ({ onSubmit }) => {
  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([]);

  useEffect(() => {
  fetch('/api/athlete')
    .then(res => res.json())
    .then(data => {
      const mappedAthletes: Athlete[] = data.map((athlete: any) => ({
        athleteId: athlete.athlete_id,
        athleteFirstName: athlete.athlete_first_name,
        athleteLastName: athlete.athlete_last_name,
        birthday: athlete.birthday,
        gender: athlete.gender,
        team: athlete.team,
        ageGroup: athlete.age_group,
      }));
      setAvailableAthletes(mappedAthletes);
    })
    .catch(err => console.error('Failed to load athletes', err));
  }, []);



    const [formData, setFormData] = useState<Session>({
        sessionDay: '',
        location: '',
        discipline: '',
        snowConditions: '',
        visConditions: '',
        terrainType: '',
        numFreeskiRuns: 0,
        numDrillRuns: 0,
        numEducationalCourseRuns: 0, 
        numGatesEducationalCourse: 0, 
        numRaceTrainingCourseRuns: 0,
        numGatesRaceTrainingCourse: 0,
        numRaceRuns: 0,
        numGatesRace: 0,
        generalComments: '',
        attendance: []
    });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // input validation 
      let isValid = true;
      let errorMessage = "";

      if (e.target.name == "discipline") {
        const allowedDisciplines = ["SL", "GS", "SG", "DH", "Other"];
        if (!allowedDisciplines.includes(e.target.value)) { // if invalid input
          isValid = false;
          errorMessage = "Please choose valid discipline.";
        }
      } else if (e.target.name == "snowConditions") {
          const allowedSnowConditions = ["Soft", "Compact-soft", "Hard grippy", "Ice", "Wet", "Salted", "Non-groomed", "Ball bearings", "Powder"];
          if (!allowedSnowConditions.includes(e.target.value)) { // if invalid input
            isValid = false;
            errorMessage = "Please choose valid snow conditions."
          }
      } else if (e.target.name == "visConditions") {
          const allowedVisConditions = ["Sunny", "Flat light", "Fog", "Snowing", "Variable", "Rain"];
          if (!allowedVisConditions.includes(e.target.value)) { // if invalid input
            isValid = false;
            errorMessage = "Please choose valid visibility conditions."
          }
       }  else if (e.target.name == "terrainType") {
          const allowedTerrainType = ["Flat", "Medium", "Steep", "Rolly", "Mixed"];
          if (!allowedTerrainType.includes(e.target.value)) { // if invalid input
            isValid = false;
            errorMessage = "Please choose valid terrain type."
          }
       } 
      setErrors((prev) => ({ ...prev, [e.target.name]: errorMessage }));
      
      if (isValid = true) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      } else {
        console.error("Invalid input. Please try again.");
      }
  };

   const handleAttendanceChange = (selectedIds: number[]) => {
    setFormData({ ...formData, attendance: selectedIds });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ 
        sessionDay: '',
        location: '',
        discipline: '',
        snowConditions: '',
        visConditions: '',
        terrainType: '',
        numFreeskiRuns: 0,
        numDrillRuns: 0,
        numEducationalCourseRuns: 0, 
        numGatesEducationalCourse: 0, 
        numRaceTrainingCourseRuns: 0,
        numGatesRaceTrainingCourse: 0,
        numRaceRuns: 0,
        numGatesRace: 0,
        generalComments: '',
        attendance: []
    });
  };


  console.log('availableAthletes:', availableAthletes);

  return (
    <div className="create-session-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">Create Session</h2>
        <div className="white-box">
          <form onSubmit={handleSubmit}>
              <label>Session Date: </label>
              <input required name="sessionDay" type="date"value={formData.sessionDay} onChange={handleChange}/>
              <label>Location: </label>
              <input type="text" required name="location" value={formData.location} onChange={handleChange}/>
              <label>Discipline: </label>
              <input type="text" required name="discipline" list="discipline" value={formData.discipline} onChange={handleChange}/>
              <datalist id="discipline">
                <option value="SL"></option>
                <option value="GS"></option>
                <option value="SG"></option>
                <option value="DH"></option>
                <option value="Other"></option>
              </datalist>
              {errors.discipline && <p className="error-text">{errors.discipline}</p>}
              <label>Snow Conditions: </label>
              <input type="text" required name="snowConditions" list="snowConditions" value={formData.snowConditions} onChange={handleChange}/>
              <datalist id="snowConditions">
                <option value="Soft"></option>
                <option value="Compact-soft"></option>
                <option value="Hard grippy"></option>
                <option value="Ice"></option>
                <option value="Wet"></option>
                <option value="Salted"></option>
                <option value="Non-groomed"></option>
                <option value="Ball bearings"></option>
                <option value="Powder"></option>
              </datalist>
              {errors.snowConditions && <p className="error-text">{errors.snowConditions}</p>}
              <label>Visibility Conditions: </label>
              <input type="text" required name="visConditions" list="visConditions" value={formData.visConditions} onChange={handleChange}/> 
              <datalist id="visConditions">
                <option value="Sunny"></option>
                <option value="Flat light"></option>
                <option value="Fog"></option>
                <option value="Snowing"></option>
                <option value="Variable"></option>
                <option value="Rain"></option>
              </datalist>
              {errors.visConditions && <p className="error-text">{errors.visConditions}</p>}
              <label>Terrain Type: </label>
              <input type="text" required name="terrainType" list="terrainType" value={formData.terrainType} onChange={handleChange}/>  
              <datalist id="terrainType">
                <option value="Flat"></option>
                <option value="Medium"></option>
                <option value="Steep"></option>
                <option value="Rolly"></option>
                <option value="Mixed"></option>
              </datalist>
              {errors.terrainType && <p className="error-text">{errors.terrainType}</p>}
              <label># of Freeski Runs: </label>
              <input type="number" required name="numFreeskiRuns" value={formData.numFreeskiRuns} onChange={handleChange}/>
              <label># of Drill Runs: </label>
              <input type="number" required name="numDrillRuns" value={formData.numDrillRuns} onChange={handleChange}/>
              <label># of Educational Course Runs: </label>
              <input type="number" required name="numEducationalCourseRuns" value={formData.numEducationalCourseRuns} onChange={handleChange}/>
              <label># of Gates in Educational Course: </label>
              <input type="number" required name="numGatesEducationalCourse" value={formData.numGatesEducationalCourse} onChange={handleChange}/>
              <label># of Race Training Course Runs: </label>
              <input type="number" required name="numRaceTrainingCourseRuns" value={formData.numRaceTrainingCourseRuns} onChange={handleChange}/>
              <label># of Gates in Race Training Course: </label>
              <input type="number" required name="numGatesRaceTrainingCourse" value={formData.numGatesRaceTrainingCourse} onChange={handleChange}/>
              <label># of Race Runs: </label>
              <input type="number" required name="numRaceRuns" value={formData.numRaceRuns} onChange={handleChange}/>
              <label># of Gates in Race Course: </label>
              <input type="number" required name="numGatesRace" value={formData.numGatesRace} onChange={handleChange}/>
              <label>General Comments: </label>
              <input type="text" name="generalComments" value={formData.generalComments} onChange={handleChange}/>
              
              <label>Attendance: </label>
              <MultiSelectEx athletes={availableAthletes} onChange={handleAttendanceChange}></MultiSelectEx>

              <button type="submit">Create Session</button>
          </form>
        </div>
      </div>
    </div>
  );

};



export default CreateSessionForm