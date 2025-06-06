// components/SessionForm.tsx

import { useState } from 'react';
import type { Session } from "../types/Session";

interface SessionFormProps {
  onSubmit: (session: Session) => void;
}

const CreateSessionForm: React.FC<SessionFormProps> = ({ onSubmit }) => {
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
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    });
  };

  return (
    <form onSubmit={handleSubmit}>
        <input name="sessionDay" placeholder="Session Date" value={formData.sessionDay} onChange={handleChange}/>
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange}/>
        <input name="discipline" placeholder="Discipline" value={formData.discipline} onChange={handleChange}/> {/* Turn into a dropdown menu! */}
        <input name="snowConditions" placeholder="Snow Conditions" value={formData.snowConditions} onChange={handleChange}/> {/* Turn into a dropdown menu! */}
        <input name="visConditions" placeholder="Visibility Conditions " value={formData.visConditions} onChange={handleChange}/> {/* Turn into a dropdown menu! */}
        <input name="terrainType" placeholder="Terrain Type" value={formData.terrainType} onChange={handleChange}/>  {/* Turn into a dropdown menu! */}
        <input name="numFreeskiRuns" placeholder="Number of Freeski Runs" value={formData.numFreeskiRuns} onChange={handleChange}/>
        <input name="numDrillRuns" placeholder="Number of Drill Runs" value={formData.numDrillRuns} onChange={handleChange}/>
        <input name="numCourseRuns" placeholder="Number of Course Runs" value={formData.numCourseRuns} onChange={handleChange}/>
        <input name="generalComments" placeholder="General Comments" value={formData.generalComments} onChange={handleChange}/>
        <button type="submit">Create Session</button>
    </form>
  );

};



export default CreateSessionForm