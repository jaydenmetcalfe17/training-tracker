import { useContext, useEffect, useState } from 'react';
import type { Session } from '../types/Session';
import SessionsList from '../components/SessionsList/SessionsList';
import { useNavigate, useParams } from 'react-router-dom';
import EditSessionForm from '../components/EditSessionForm';
import AuthContext from '../context/AuthContext';
import AttendanceList from '../components/AttendanceList';


const SessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const { user } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(true);
 
  
  // let sessions: Session[] = session ? [session] : [];

  useEffect(() => {
     if (user?.status == 'athlete'){
      setIsVisible(!isVisible);
    }

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
          const sessionData = Array.isArray(data) ? data[0] : data;

          const mappedSession: Session = {
            sessionId: sessionData.session_id,
            sessionDay: new Date(sessionData.session_day).toISOString().split("T")[0],
            startTime: sessionData.startTime,
            endTime: sessionData.endTime,
            location: sessionData.location,
            discipline: sessionData.discipline,
            snowConditions: sessionData.snow_conditions,
            visConditions: sessionData.vis_conditions,
            terrainType: sessionData.terrain_type,
            numFreeskiRuns: sessionData.num_freeski_runs,
            numDrillRuns: sessionData.num_drill_runs,
            numEducationalCourseRuns: sessionData.num_educational_course_runs,
            numGatesEducationalCourse: sessionData.num_gates_educational_course,
            numRaceTrainingCourseRuns: sessionData.num_race_training_course_runs,
            numGatesRaceTrainingCourse: sessionData.num_gates_race_training_course,
            numRaceRuns: sessionData.num_race_runs,
            numGatesRace: sessionData.num_gates_race,
            generalComments: sessionData.general_comments,
            receivedAttendance: sessionData.attendance.map((a: any) => ({
              attendanceId: a.attendanceId,
              individualComments: a.individualComments,
              athlete: {
                  athleteId: a.athlete.athleteId,
                  athleteFirstName: a.athlete.athleteFirstName,
                  athleteLastName: a.athlete.athleteLastName,
                  birthday: a.athlete.birthday,
                  gender: a.athlete.gender,
                  userId: a.athlete.userId,
                  team: a.athlete.team,
                  ageGroup: a.athlete.ageGroup,
                },
            })),
          };
          console.log("RECEIVED ATTENDANCE: ", mappedSession.receivedAttendance);
          setSession(mappedSession);
          console.log('Session found:', mappedSession);
      })
        .catch((err) => console.log('Unable to find session: ', err));
  }, []);

  //edit/update session
    const [showEditPopup, setShowEditPopup] = useState(false);
    const toggleEditPopup = () => {
      console.log("p;laying around: ", session);
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


      //testing
      fetch("http://localhost:8000/api/python/summary", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
            console.log('Session pulled:', data);
        })
        .catch((err) => console.error('Failed to update session', err));
      // testing


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
        {isVisible && <button className="edit-button" onClick={toggleEditPopup}>Edit Session</button>}
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
        {isVisible && <button className="delete-button" onClick={toggleDeletePopup}>Delete Session</button>}
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
        {session ? (
          <>
            <SessionsList sessions={[session]} />
            {isVisible && <AttendanceList session={session} />}
          </>
          ) : (
            <p>Loading session...</p>
          )}
      </div>
    </div>
  )
}

export default SessionPage