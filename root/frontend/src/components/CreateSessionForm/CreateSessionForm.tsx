// components/SessionForm.tsx
import { useContext, useEffect, useRef, useState } from 'react';
import type { Session } from "../../types/Session";
import type { Athlete } from '../../types/Athlete';
import MultiSelectEx from '../Multiselect/Multiselect';
import AuthContext from '../../context/AuthContext';
import "./CreateSessionForm.scss";

interface SessionFormProps {
  onSubmit: (session: Session) => void;
}

const CreateSessionForm: React.FC<SessionFormProps> = ({ onSubmit }) => {
  const { user } = useContext(AuthContext);

  // Keep available athletes in state (async fetch)
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

  // Attendance state
  const [attendance, setAttendance] = useState<number[]>([]);
  const handleAttendanceChange = (selectedIds: number[]) => setAttendance(selectedIds);

  // Refs for all other inputs
  const sessionDayRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);
  const disciplineRef = useRef<HTMLInputElement>(null);
  const snowConditionsRef = useRef<HTMLInputElement>(null);
  const visConditionsRef = useRef<HTMLInputElement>(null);
  const terrainTypeRef = useRef<HTMLInputElement>(null);
  const numFreeskiRunsRef = useRef<HTMLInputElement>(null);
  const numDrillRunsRef = useRef<HTMLInputElement>(null);
  const numEducationalCourseRunsRef = useRef<HTMLInputElement>(null);
  const numGatesEducationalCourseRef = useRef<HTMLInputElement>(null);
  const numRaceTrainingCourseRunsRef = useRef<HTMLInputElement>(null);
  const numGatesRaceTrainingCourseRef = useRef<HTMLInputElement>(null);
  const numRaceRunsRef = useRef<HTMLInputElement>(null);
  const numGatesRaceRef = useRef<HTMLInputElement>(null);
  const generalCommentsRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newSession: Session = {
      sessionDay: sessionDayRef.current?.value || '',
      startTime: startTimeRef.current?.value || '',
      endTime: endTimeRef.current?.value || '',
      location: locationRef.current?.value || '',
      discipline: disciplineRef.current?.value || '',
      snowConditions: snowConditionsRef.current?.value || '',
      visConditions: visConditionsRef.current?.value || '',
      terrainType: terrainTypeRef.current?.value || '',
      numFreeskiRuns: Number(numFreeskiRunsRef.current?.value) || 0,
      numDrillRuns: Number(numDrillRunsRef.current?.value) || 0,
      numEducationalCourseRuns: Number(numEducationalCourseRunsRef.current?.value) || 0,
      numGatesEducationalCourse: Number(numGatesEducationalCourseRef.current?.value) || 0,
      numRaceTrainingCourseRuns: Number(numRaceTrainingCourseRunsRef.current?.value) || 0,
      numGatesRaceTrainingCourse: Number(numGatesRaceTrainingCourseRef.current?.value) || 0,
      numRaceRuns: Number(numRaceRunsRef.current?.value) || 0,
      numGatesRace: Number(numGatesRaceRef.current?.value) || 0,
      generalComments: generalCommentsRef.current?.value || '',
      attendance,
      createdBy: user?.userId,
    };

    onSubmit(newSession);

    // Reset refs
    [
      sessionDayRef, startTimeRef, endTimeRef, locationRef, disciplineRef,
      snowConditionsRef, visConditionsRef, terrainTypeRef, numFreeskiRunsRef,
      numDrillRunsRef, numEducationalCourseRunsRef, numGatesEducationalCourseRef,
      numRaceTrainingCourseRunsRef, numGatesRaceTrainingCourseRef,
      numRaceRunsRef, numGatesRaceRef, generalCommentsRef
    ].forEach(ref => {
      if (ref.current) ref.current.value = '';
    });

    setAttendance([]); // reset attendance
  };

  return (
    <div className="create-session-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">Create Session</h2>
        <div className="white-box">
          <form className="create-session-form" onSubmit={handleSubmit}>
            <div className="three-column-form">
              <div className="form-group">
                <label>Session Date:</label>
                <input required type="date" ref={sessionDayRef} />
              </div>

              <div className="form-group">
                <label>Start Time:</label>
                <input required type="text" placeholder="0:00" ref={startTimeRef} />
              </div>

              <div className="form-group">
                <label>End Time:</label>
                <input required type="text" placeholder="0:00" ref={endTimeRef} />
              </div>

              <div className="form-group">
                <label>Location:</label>
                <input required type="text" ref={locationRef} />
              </div>

              <div className="form-group">
                <label>Discipline:</label>
                <input required list="discipline" ref={disciplineRef} />
                <datalist id="discipline">
                  <option value="SL" />
                  <option value="GS" />
                  <option value="SG" />
                  <option value="DH" />
                  <option value="Other" />
                </datalist>
              </div>

              <div className="form-group">
                <label>Snow Conditions:</label>
                <input required list="snowConditions" ref={snowConditionsRef} />
                <datalist id="snowConditions">
                  <option value="Soft" />
                  <option value="Compact-soft" />
                  <option value="Hard grippy" />
                  <option value="Ice" />
                  <option value="Wet" />
                  <option value="Salted" />
                  <option value="Non-groomed" />
                  <option value="Ball bearings" />
                  <option value="Powder" />
                </datalist>
              </div>

              <div className="form-group">
                <label>Visibility Conditions:</label>
                <input required list="visConditions" ref={visConditionsRef} />
                <datalist id="visConditions">
                  <option value="Sunny" />
                  <option value="Flat light" />
                  <option value="Fog" />
                  <option value="Snowing" />
                  <option value="Variable" />
                  <option value="Rain" />
                </datalist>
              </div>

              <div className="form-group">
                <label>Terrain Type:</label>
                <input required list="terrainType" ref={terrainTypeRef} />
                <datalist id="terrainType">
                  <option value="Flat" />
                  <option value="Medium" />
                  <option value="Steep" />
                  <option value="Rolly" />
                  <option value="Mixed" />
                </datalist>
              </div>

              <div className="form-group">
                <label># of Freeski Runs:</label>
                <input required type="number" ref={numFreeskiRunsRef} />
              </div>

              <div className="form-group">
                <label># of Drill Runs:</label>
                <input required type="number" ref={numDrillRunsRef} />
              </div>

              <div className="form-group">
                <label># of Educational Course Runs:</label>
                <input required type="number" ref={numEducationalCourseRunsRef} />
              </div>

              <div className="form-group">
                <label># of Gates in Educational Course:</label>
                <input required type="number" ref={numGatesEducationalCourseRef} />
              </div>

              <div className="form-group">
                <label># of Race Training Course Runs:</label>
                <input required type="number" ref={numRaceTrainingCourseRunsRef} />
              </div>

              <div className="form-group">
                <label># of Gates in Race Training Course:</label>
                <input required type="number" ref={numGatesRaceTrainingCourseRef} />
              </div>

              <div className="form-group">
                <label># of Race Runs:</label>
                <input required type="number" ref={numRaceRunsRef} />
              </div>

              <div className="form-group">
                <label># of Gates in Race Course:</label>
                <input required type="number" ref={numGatesRaceRef} />
              </div>

              <div className="form-group">
                <label>General Comments:</label>
                <input type="text" ref={generalCommentsRef} />
              </div>

              <div className="form-group">
                <label>Attendance:</label>
                <MultiSelectEx athletes={availableAthletes} onChange={handleAttendanceChange} />
              </div>
            </div>
            <button type="submit">Create Session</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSessionForm;
