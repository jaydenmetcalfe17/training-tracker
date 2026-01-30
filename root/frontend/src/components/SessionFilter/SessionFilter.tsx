import { useEffect, useRef, useState } from "react";
import type { Session } from '../../types/Session';
import SessionsList from '../SessionsList/SessionsList';
import type { Athlete } from '../../types/Athlete';
import PieChart from "../PieChart";
import './SessionFilter.scss';

interface FilterSessionsProps {
  athlete?: Athlete | null;
}

const SessionFilter: React.FC<FilterSessionsProps>= ({ athlete }) => {
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);

  // create refs for all form inputs
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const disciplineRef = useRef<HTMLInputElement>(null);
  const snowConditionsRef = useRef<HTMLInputElement>(null);
  const visConditionsRef = useRef<HTMLInputElement>(null);
  const terrainTypeRef = useRef<HTMLInputElement>(null);

  const fetchSessions = () => {
    const params = new URLSearchParams();

    if (athlete?.athleteId) params.append("athleteId", athlete.athleteId.toString());

    if (startDateRef.current?.value) params.append("startDate", startDateRef.current.value);
    if (endDateRef.current?.value) params.append("endDate", endDateRef.current.value);
    if (locationRef.current?.value) params.append("location", locationRef.current.value);
    if (disciplineRef.current?.value) params.append("discipline", disciplineRef.current.value);
    if (snowConditionsRef.current?.value) params.append("snowConditions", snowConditionsRef.current.value);
    if (visConditionsRef.current?.value) params.append("visConditions", visConditionsRef.current.value);
    if (terrainTypeRef.current?.value) params.append("terrainType", terrainTypeRef.current.value);

    fetch(`/api/session?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const mappedSessions: Session[] = data.map((session: any) => ({
          sessionId: session.session_id,
          sessionDay: new Date(session.session_day).toISOString().split("T")[0],
          startTime: session.startTime,
          endTime: session.endTime,
          location: session.location,
          discipline: session.discipline,
          snowConditions: session.snow_conditions,
          visConditions: session.vis_conditions,
          terrainType: session.terrain_type,
          numFreeskiRuns: session.num_freeski_runs,
          numDrillRuns: session.num_drill_runs,
          numEducationalCourseRuns: session.num_educational_course_runs,
          numGatesEducationalCourse: session.num_gates_educational_course,
          numRaceTrainingCourseRuns: session.num_race_training_course_runs,
          numGatesRaceTrainingCourse: session.num_gates_race_training_course,
          numRaceRuns: session.num_race_runs,
          numGatesRace: session.num_gates_race,
          generalComments: session.general_comments,
        }));
        setFilteredSessions(mappedSessions);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSessions();
  }, [athlete]); 


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions();
  };

  return (
    <>
    <div className="pie-filter-box">
      <div className="details-filters-box">
        { 
            (athlete != null)
              ? <>
                  <h2 className="athlete-name">{athlete.athleteFirstName.toUpperCase()} {athlete.athleteLastName.toUpperCase()}</h2>
                  <div className="athlete-info-box">
                    <h3>Birthday: {athlete.birthday.split("T")[0]}</h3>
                    <h3>Age Group: {athlete.ageGroup}</h3>
                    <h3>Team: {athlete.team}</h3>
                  </div>
                </>
              : <h2 className="athlete-name">SESSIONS</h2>
          }
          <div className="search-sessions-list-box">
              <form className="filters-form" onSubmit={handleSubmit}>
                <div className="filters-form-labels">
                  <div className="filters-lab-in">
                    <label>Start Date: </label>
                    <input type="date" ref={startDateRef} />
                  </div>

                  <div className="filters-lab-in">
                    <label>End Date: </label>
                    <input type="date" ref={endDateRef} />
                  </div>

                  <div className="filters-lab-in">
                    <label>Location: </label>
                    <input type="text" ref={locationRef} />
                  </div>

                  <div className="filters-lab-in">
                    <label>Discipline: </label>
                    <input type="text" ref={disciplineRef} />
                  </div>

                  <div className="filters-lab-in">
                    <label>Snow Conditions: </label>
                    <input type="text" ref={snowConditionsRef} />
                  </div>

                  <div className="filters-lab-in">
                    <label>Visibility Conditions: </label>
                    <input type="text" ref={visConditionsRef} />
                  </div>

                  <div className="filters-lab-in">
                    <label>Terrain Type: </label>
                    <input type="text" ref={terrainTypeRef} />
                  </div>
                </div>

                <button type="submit">Apply Filters</button>
              </form>
            </div>
          </div>
          <div className="pie-chart">
              <PieChart selection={"sessions"} athleteId={athlete?.athleteId}/>
          </div>

      </div>
      <SessionsList sessions={filteredSessions} />
    </>
  );
};

export default SessionFilter;
