// components/AttendanceList.tsx
import type { Attendance } from "../types/Attendance";
// import Table from "../Table";

interface AttendanceListProps {
  attendance: Attendance[] | undefined;
};


const AttendanceList: React.FC<AttendanceListProps> = ({ attendance }) => {
  console.log("loading attendance: ", attendance);
  
  if(!attendance) return;

  return (
    <div className="attendance-list-box">
      <div className="light-tan-box">
        <div className="white-box" id="attendance-white-box">
          <table>
            <thead>
              <tr>
                <th>Name: </th>
                <th></th>
                <th>Individual Comments: </th>
              </tr>
            </thead>
            
            <tbody>
              {attendance?.map((attendance, index) => (
                <tr key={index}>
                  <td>{attendance.athlete.athleteFirstName}</td>
                  <td>{attendance.athlete.athleteLastName}</td>
                  <td>{attendance.individualComments}</td>
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