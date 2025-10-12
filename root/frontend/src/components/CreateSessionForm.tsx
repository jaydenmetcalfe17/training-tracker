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
        numCourseRuns: 0,
        generalComments: '',
        attendance: []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        numCourseRuns: 0,
        generalComments: '',
        attendance: []
    });
  };


  console.log('availableAthletes:', availableAthletes);

  return (
    <form onSubmit={handleSubmit}>
        <input name="sessionDay" type="date" placeholder="Session Date" value={formData.sessionDay} onChange={handleChange}/>
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange}/>
        <input name="discipline" list="discipline" placeholder="Discipline" value={formData.discipline} onChange={handleChange}/>
        <datalist id="discipline">
          <option value="SL"></option>
          <option value="GS"></option>
          <option value="SG"></option>
          <option value="DH"></option>
          <option value="Other"></option>
        </datalist>
        <input name="snowConditions" list="snowConditions" placeholder="Snow Conditions" value={formData.snowConditions} onChange={handleChange}/>
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
        <input name="visConditions" list="visConditions" placeholder="Visibility Conditions " value={formData.visConditions} onChange={handleChange}/> 
        <datalist id="visConditions">
          <option value="Sunny"></option>
          <option value="Flat light"></option>
          <option value="Fog"></option>
          <option value="Snowing"></option>
          <option value="Variable"></option>
          <option value="Rain"></option>
        </datalist>
        <input name="terrainType" list="terrainType" placeholder="Terrain Type" value={formData.terrainType} onChange={handleChange}/>  
        <datalist id="terrainType">
          <option value="Flat"></option>
          <option value="Medium"></option>
          <option value="Steep"></option>
          <option value="Rolly"></option>
          <option value="Mixed"></option>
        </datalist>
        <input name="numFreeskiRuns" placeholder="Number of Freeski Runs" value={formData.numFreeskiRuns} onChange={handleChange}/>
        <input name="numDrillRuns" placeholder="Number of Drill Runs" value={formData.numDrillRuns} onChange={handleChange}/>
        <input name="numCourseRuns" placeholder="Number of Course Runs" value={formData.numCourseRuns} onChange={handleChange}/>
        <input name="generalComments" placeholder="General Comments" value={formData.generalComments} onChange={handleChange}/>
        
        <MultiSelectEx athletes={availableAthletes} onChange={handleAttendanceChange}></MultiSelectEx>

        <button type="submit">Create Session</button>
    </form>
  );

};



export default CreateSessionForm