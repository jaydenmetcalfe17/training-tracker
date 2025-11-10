// components/AttendanceList.tsx
import { useEffect, useState } from "react";
import type { Session } from "../types/Session";
import type { Athlete } from "../types/Athlete";
import MultiSelectEx from "./Multiselect/Multiselect";
// import Table from "../Table";

interface AttendanceListProps {
  session: Session | null;
};


const AttendanceList: React.FC<AttendanceListProps> = ({ session }) => {

  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([]);
  const attendance = session?.receivedAttendance;
  const attendanceIds = attendance?.map(attendance => attendance.athlete.athleteId)


  useEffect(() => {

      fetch('/api/athlete')
        .then(res => res.json())
        .then(data => {
          const mappedAthletes: Athlete[] = data.map((athlete: any) => ({  //turn this into a data structure for better run time
            athleteId: athlete.athlete_id,
            athleteFirstName: athlete.athlete_first_name,
            athleteLastName: athlete.athlete_last_name,
            birthday: athlete.birthday,
            gender: athlete.gender,
            team: athlete.team,
            ageGroup: athlete.age_group,
          }));
        
          // don't set athletes already in attendance -- they are not available:
          const includeThem: Athlete[] = [];
          for (const athlete of mappedAthletes) {
            if (!attendanceIds?.includes(athlete.athleteId)) {
                includeThem.push(athlete)
            } 
          }
          setAvailableAthletes(includeThem);
        })
        .catch(err => console.error('Failed to load athletes', err));
  }, []);


  const deleteAthleteAttendance = async (athleteId: number | undefined) => {
        if (!session?.sessionId) return;

        fetch(`/api/attendance/${athleteId}/${session.sessionId}`, {
    
            method: 'DELETE',
            headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((res) => res.json())
            .then((data) => {
                console.log('Athlete attendance deleted:', data);
            })
            .catch((err) => console.error('Failed to delete athlete attendance', err)); 
    };



  const handleAttendanceChange = (selectedIds: number[]) => {
    if (!selectedIds) return;

    console.log("selectedIds: ", selectedIds);

        fetch(`/api/attendance/`, {
    
            method: 'PUT',
            headers: {
                    'Content-Type': 'application/json',
                },
            body: JSON.stringify({
                    sessionId: session?.sessionId,
                    athleteIds: selectedIds
                })
            })
            .then((res) => res.json())
            .then((data) => {
                console.log('Athlete attendance added:', data);
            })
            .catch((err) => console.error('Failed to add athlete attendance', err)); 

    toggleEditPopup();
  };


  const [showEditPopup, setShowEditPopup] = useState(false);
  const toggleEditPopup = () => {
    setShowEditPopup(!showEditPopup);
  };





  return (
    <div className="attendance-list-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">Attendance</h2>
        <button onClick={toggleEditPopup}>Add Athlete to Attendance</button>
        <div>
          {showEditPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <MultiSelectEx athletes={availableAthletes} onChange={handleAttendanceChange}></MultiSelectEx>
              </div>
            </div>
          )}
      </div>
        <div className="white-box" id="attendance-white-box">
          <table>
            <thead>
              <tr>
                <th>Name: </th>
                <th></th>
                <th>Individual Comments: </th>
                <th></th> 
              </tr>
            </thead>
            
            <tbody>
              {attendance?.map((attendance, index) => (
                <tr key={index}>
                  <td>{attendance.athlete.athleteFirstName}</td>
                  <td>{attendance.athlete.athleteLastName}</td>
                  <td>{attendance.individualComments}</td>
                  <td>
                    <button onClick={() => deleteAthleteAttendance(attendance.athlete.athleteId)}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
         </div>
      </div>
    </div>
  );
};

export default AttendanceList