import { useContext, useEffect, useRef, useState } from "react";
import type { Session } from '../../types/Session';
import SessionsList from '../SessionsList/SessionsList';
import type { Athlete } from '../../types/Athlete';
import PieChart from "../PieChart";
import './SessionFilter.scss';
// import { useNavigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import EditAthleteForm from "../EditAthleteForm";

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GenerateInviteButton from "../GenerateInviteButton/GenerateInviteButton";

interface FilterSessionsProps {
  athlete?: Athlete | null;
}

const SessionFilter: React.FC<FilterSessionsProps>= ({ athlete }) => {
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const { user } = useContext(AuthContext);
  // const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  // const params2 = useParams();

  // create refs for all form inputs
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const disciplineRef = useRef<HTMLInputElement>(null);
  const snowConditionsRef = useRef<HTMLInputElement>(null);
  const visConditionsRef = useRef<HTMLInputElement>(null);
  const terrainTypeRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   let insert = ''
  //   if (user?.status == 'coach') {
  //     insert = `athleteId=${params2.athleteId}`
  //   } else if (user?.status == 'athlete') {
  //     insert = `userId=${user?.userId}`
  //     setIsVisible(!isVisible);
  //   }

  //   fetchSessions();
  // }, [athlete]);

  const isCoach = user?.status === 'coach';

  useEffect(() => {
    fetchSessions();
  }, [athlete, user]); // run whenever athlete or user changes



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
          startTime: session.start_time.slice(0, 5),
          endTime: session.end_time.slice(0, 5),
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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions();
  };

     //edit/update athlete profile info
    const [showEditPopup, setShowEditPopup] = useState(false);
    const toggleEditPopup = () => {
      setShowEditPopup(!showEditPopup);
    };
  
    const editAthleteProfile = (updatedAthlete: Athlete) => {
      console.log("updated: ", updatedAthlete);
        if (!updatedAthlete) return; 
        if (!athlete) return;  
  
        fetch(`/api/athlete/${athlete.athleteId}`, {
      // fetch('http://localhost:3000/api/athlete', {    // for when the vite.config.ts file is not redirecting to localhost:3000
        method: 'PUT',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAthlete),
        })
        .then((res) => res.json())
        .then((data) => {
            console.log('Athlete updated:', data);
        })
        .catch((err) => console.error('Failed to update athlete profile', err));
  
        toggleEditPopup();
    };
  
    // delete athlete 
      const [showDeletePopup, setShowDeletePopup] = useState(false);
      const toggleDeletePopup = () => {
        setShowDeletePopup(!showDeletePopup);
      };
  
      const deleteAthlete = () => {
          if (!athlete) return;  
    
          fetch(`/api/athlete/${athlete.athleteId}`, {
        // fetch('http://localhost:3000/api/athlete', {    // for when the vite.config.ts file is not redirecting to localhost:3000
          method: 'DELETE',
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(athlete),
          })
          .then((res) => res.json())
          .then((data) => {
              console.log('Athlete deleted:', data);
          })
          .catch((err) => console.error('Failed to delete athlete', err));
          
          navigate(`/dashboard`);
      };

    if (!athlete) return null;

  return (
    <>
    <div className="pie-filter-box">
      <div className="details-filters-box">
        <div className="pie-info-box">
          <div className="info-buttons-box">
            <div className="athlete-info-box">
              { 
                  (athlete != null)
                    ? <>
                        <h2 className="athlete-name">{athlete.athleteFirstName.toUpperCase()} {athlete.athleteLastName.toUpperCase()}</h2>
                        <div className="athlete-details-box">
                          <h3>Birthday: {athlete.birthday.split("T")[0]}</h3>
                          <h3>Age Group: {athlete.ageGroup}</h3>
                          <h3>Team: {athlete.team}</h3>
                        </div>
                      </>
                    : <h2 className="athlete-name">SESSIONS</h2>
                }
              </div>
            <div className="delete-edit-button-box"> 
              <div>
                {isCoach && <button className="main-button" id="edit-button" onClick={toggleEditPopup}><EditIcon></EditIcon></button>}
                {showEditPopup && (
                  <div className="popup-overlay">
                    <div className="popup-content">
                      <EditAthleteForm athlete={athlete} onSubmit={editAthleteProfile}/>
                    </div>
                  </div>
                )}
              </div>
              <div>
                {isCoach && <button onClick={toggleDeletePopup} className="main-button" id="delete-button"><DeleteIcon></DeleteIcon></button>}
                {showDeletePopup && (
                  <div className="popup-overlay">
                    <div className="popup-content">
                      <div className="light-tan-box">
                        <div className="white-box" id="delete-athlete-box">
                          <h3>Are you sure you want to delete this athlete?</h3>
                          <button onClick={deleteAthlete}>Yes, delete the athlete</button>
                          <button onClick={toggleDeletePopup}>No, keep the athlete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div> 
            <div className="buttons-box">
              {isCoach && <div className="generate-invite-butt">
                <div className="generate-invite-box">
                  <h3>Invite an Athlete: </h3>
                  <GenerateInviteButton athleteId={athlete.athleteId} role="athlete"/>
                </div>
                <div className="generate-invite-box">
                  <h3>Invite a Parent: </h3>
                  <GenerateInviteButton athleteId={athlete.athleteId} role="parent"/>
                </div>
              </div>}
            </div>
          </div>
          <div className="pie-chart">
                <PieChart selection={"sessions"} athleteId={athlete?.athleteId}/>
          </div>
        </div>
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

                <button className="main-button" id="apply-filters-button" type="submit">Apply Filters</button>
              </form>
            </div>
          </div>

      </div>
      <SessionsList sessions={filteredSessions} />
    </>
  );
};

export default SessionFilter;
