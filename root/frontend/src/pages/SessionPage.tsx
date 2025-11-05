import { useEffect, useState } from 'react';
import type { Session } from '../types/Session';
import SessionsList from '../components/SessionsList/SessionsList';
import { useNavigate, useParams } from 'react-router-dom';
import EditSessionForm from '../components/EditSessionForm';


const SessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  
  let sessions: Session[] = session ? [session] : [];

  useEffect(() => {
    if (!sessionId) return;   

    fetch(`/api/session?sessionId=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }) 
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to find session');
          }
          return res.json();
        })
       .then((data) => {
          console.log("DATA: ", data);
          const mappedSession: Session = {
            sessionId: data[0].session_id,
            sessionDay: new Date(data[0].session_day).toISOString().split("T")[0],
            location: data[0].location,
            discipline: data[0].discipline,
            snowConditions: data[0].snow_conditions,
            visConditions: data[0].vis_conditions,
            terrainType: data[0].terrain_type,
            numFreeskiRuns: data[0].num_freeski_runs,
            numDrillRuns: data[0].num_drill_runs,
            numEducationalCourseRuns: data[0].num_educational_course_runs,
            numGatesEducationalCourse: data[0].num_gates_educational_course,
            numRaceTrainingCourseRuns: data[0].num_race_training_course_runs,
            numGatesRaceTrainingCourse: data[0].num_gates_race_training_course,
            numRaceRuns: data[0].num_race_runs,
            numGatesRace: data[0].num_gates_race,
            generalComments: data[0].general_comments,
          };
          setSession(mappedSession);
          console.log('Session found:', mappedSession);
      })
        .catch((err) => console.log('Unable to find session: ', err));
  }, []);

  //edit/update session
    const [showEditPopup, setShowEditPopup] = useState(false);
    const toggleEditPopup = () => {
      setShowEditPopup(!showEditPopup);
    };
  
    const editSession = (updatedSession: Session) => {
      console.log("updated: ", updatedSession);
        if (!updatedSession) return; 
        if (!session) return;  
  
        fetch(`/api/session/${session.sessionId}`, {
      // fetch('http://localhost:3000/api/athlete', {    // for when the vite.config.ts file is not redirecting to localhost:3000
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSession),
        })
        .then((res) => res.json())
        .then((data) => {
            console.log('Session updated:', data);
        })
        .catch((err) => console.error('Failed to update session', err));
  
        toggleEditPopup();
    };

    // delete session functionality
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const toggleDeletePopup = () => {
      setShowDeletePopup(!showDeletePopup);
    };

    const deleteSession = () => {
        if (!session) return;  
  
        fetch(`/api/session/${session.sessionId}`, {
      // fetch('http://localhost:3000/api/athlete', {    // for when the vite.config.ts file is not redirecting to localhost:3000
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
        })
        .then((res) => res.json())
        .then((data) => {
            console.log('Session deleted:', data);
        })
        .catch((err) => console.error('Failed to delete session', err));
        
        navigate(`/dashboard`);
    };

    
    // navigation back to dashboard
    const handleBackClick = () => {
      navigate(`/dashboard`);
    };



  return (
    <div>
      <div>
        <button className="back-button" onClick={() => handleBackClick()}>Back to Dashboard</button> {/* make this only for coach POV */}
      </div>
      <div>
        <button className="edit-button" onClick={toggleEditPopup}>Edit Session</button>
          {showEditPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <EditSessionForm session={session} onSubmit={editSession}/>
                {/* <button onClick={toggleEditPopup}>Edit Athlete</button> */}
              </div>
            </div>
          )}
      </div>
      <div>
        <button className="delete-button" onClick={toggleDeletePopup}>Delete Session</button>
          {showDeletePopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h3>Are you sure you want to delete this session?</h3>
                <button onClick={deleteSession}>Yes, delete the session</button>
                <button onClick={toggleDeletePopup}>No, keep the session</button>
              </div>
            </div>
          )}
      </div>
      <div>
        <SessionsList sessions = {sessions}/>  {/* Turn this into a Single Session Component */}
      </div>
    </div>
  )
}

export default SessionPage