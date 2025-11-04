// components/EditSessionForm.tsx

import { useEffect, useState } from 'react';
import type { Session } from "../types/Session";
import type { Athlete } from '../types/Athlete';
import MultiSelectEx from './Multiselect/Multiselect';


interface EditSessionFormProps {
  session: Session | null,
  onSubmit: (session: Session) => void;
}

const EditSessionForm: React.FC<EditSessionFormProps> = ({ session, onSubmit }) => {
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

    useEffect(() => {
    if (session) {
      setFormData({
        sessionDay: session.sessionDay ? new Date(session.sessionDay).toISOString().slice(0, 10) : "",
        location: session.location,
        discipline: session.discipline,
        snowConditions: session.snowConditions,
        visConditions: session.visConditions,
        terrainType: session.terrainType,
        numFreeskiRuns: session.numFreeskiRuns,
        numDrillRuns: session.numDrillRuns,
        numEducationalCourseRuns: session.numEducationalCourseRuns, 
        numGatesEducationalCourse: session.numGatesEducationalCourse, 
        numRaceTrainingCourseRuns: session.numRaceTrainingCourseRuns,
        numGatesRaceTrainingCourse: session.numGatesRaceTrainingCourse,
        numRaceRuns: session.numRaceRuns,
        numGatesRace: session.numGatesRace,
        generalComments: session.generalComments,
        attendance: session.attendance
      });
    }
  }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

   const handleAttendanceChange = (selectedIds: number[]) => {
    setFormData({ ...formData, attendance: selectedIds });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting formData:", formData);
    onSubmit(formData);
  };


  console.log('availableAthletes:', availableAthletes);

  return (
    <div className="edit-session-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">Edit Session</h2>
        <div className="white-box">
          <form onSubmit={handleSubmit}>
              <label>Session Date: </label>
              <input name="sessionDay" type="date"value={formData.sessionDay} onChange={handleChange}/>
              <label>Location: </label>
              <input name="location" value={formData.location} onChange={handleChange}/>
              <label>Discipline: </label>
              <input name="discipline" list="discipline" value={formData.discipline} onChange={handleChange}/>
              <datalist id="discipline">
                <option value="SL"></option>
                <option value="GS"></option>
                <option value="SG"></option>
                <option value="DH"></option>
                <option value="Other"></option>
              </datalist>
              <label>Snow Conditions: </label>
              <input name="snowConditions" list="snowConditions" value={formData.snowConditions} onChange={handleChange}/>
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
              <label>Visibility Conditions: </label>
              <input name="visConditions" list="visConditions" value={formData.visConditions} onChange={handleChange}/> 
              <datalist id="visConditions">
                <option value="Sunny"></option>
                <option value="Flat light"></option>
                <option value="Fog"></option>
                <option value="Snowing"></option>
                <option value="Variable"></option>
                <option value="Rain"></option>
              </datalist>
              <label>Terrain Type: </label>
              <input name="terrainType" list="terrainType" value={formData.terrainType} onChange={handleChange}/>  
              <datalist id="terrainType">
                <option value="Flat"></option>
                <option value="Medium"></option>
                <option value="Steep"></option>
                <option value="Rolly"></option>
                <option value="Mixed"></option>
              </datalist>
              <label># of Freeski Runs: </label>
              <input name="numFreeskiRuns" value={formData.numFreeskiRuns} onChange={handleChange}/>
              <label># of Drill Runs: </label>
              <input name="numDrillRuns" value={formData.numDrillRuns} onChange={handleChange}/>
              <label># of Educational Course Runs: </label>
              <input name="numEducationalCourseRuns" value={formData.numEducationalCourseRuns} onChange={handleChange}/>
              <label># of Gates in Educational Course: </label>
              <input name="numGatesEducationalCourse" value={formData.numGatesEducationalCourse} onChange={handleChange}/>
              <label># of Race Training Course Runs: </label>
              <input name="numRaceTrainingCourseRuns" value={formData.numRaceTrainingCourseRuns} onChange={handleChange}/>
              <label># of Gates in Race Training Course: </label>
              <input name="numGatesRaceTrainingCourse" value={formData.numGatesRaceTrainingCourse} onChange={handleChange}/>
              <label># of Race Runs: </label>
              <input name="numRaceRuns" value={formData.numRaceRuns} onChange={handleChange}/>
              <label># of Gates in Race Course: </label>
              <input name="numGatesRace" value={formData.numGatesRace} onChange={handleChange}/>
              <label>General Comments: </label>
              <input name="generalComments" value={formData.generalComments} onChange={handleChange}/>
              
              <label>Attendance: </label>
              <MultiSelectEx athletes={availableAthletes} onChange={handleAttendanceChange}></MultiSelectEx>

              <button type="submit">Edit Session</button>
          </form>
        </div>
      </div>
    </div>
  );

};



export default EditSessionForm