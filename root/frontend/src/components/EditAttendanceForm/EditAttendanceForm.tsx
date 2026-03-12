// pages/EditAttendanceForm.tsx

import { useEffect, useState } from 'react';
import "./EditAttendanceForm.scss";
import type { Attendance } from '../../types/Attendance';


interface EditAttendanceFormProps {
  attendance: Attendance | null,
  onSubmit: (attendance: Attendance) => void;
}




const EditAttendanceForm: React.FC<EditAttendanceFormProps> = ({ attendance, onSubmit }) => {
    const [formData, setFormData] = useState<Attendance>({
    attendanceId: attendance?.attendanceId,
    individualComments: ""
  });


  // Sync formData whenever athlete changes
  useEffect(() => {
    if (attendance) {
      setFormData({
        attendanceId: attendance.attendanceId,
        individualComments: attendance?.individualComments,
    
      });
    }
  }, [attendance]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting formData:", formData);
    onSubmit(formData);
  };



  return (
    <div className="edit-attendance-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">Edit Individual Comment</h2>
        <div className="white-box">
          <form onSubmit={handleSubmit}>
            <label>Individual Comment: </label>
            <input name="individualComments" value={formData.individualComments ?? ""} onChange={handleChange}/>
            <button type="submit">Edit</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditAttendanceForm


