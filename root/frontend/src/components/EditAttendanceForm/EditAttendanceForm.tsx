// components/EditAttendanceForm/EditAttendanceForm.tsx

import { useEffect, useState } from 'react';
import "./EditAttendanceForm.scss";
import type { Attendance } from '../../types/Attendance';

interface EditAttendanceFormProps {
  attendance: Attendance | null,
  onSubmit: (attendance: Attendance) => void;
}

interface FormState {
  attendanceId?: number;
  individualComments: string;
  freeskiRuns: string;
  drillRuns: string;
  educationalCourseRuns: string;
  raceTrainingCourseRuns: string;
  raceRuns: string;
}

const toFieldValue = (value: number | null | undefined) =>
  value != null ? String(value) : "";

const EditAttendanceForm: React.FC<EditAttendanceFormProps> = ({ attendance, onSubmit }) => {
  const [formData, setFormData] = useState<FormState>({
    attendanceId: attendance?.attendanceId,
    individualComments: attendance?.individualComments ?? "",
    freeskiRuns: toFieldValue(attendance?.freeskiRuns),
    drillRuns: toFieldValue(attendance?.drillRuns),
    educationalCourseRuns: toFieldValue(attendance?.educationalCourseRuns),
    raceTrainingCourseRuns: toFieldValue(attendance?.raceTrainingCourseRuns),
    raceRuns: toFieldValue(attendance?.raceRuns),
  });

  // Sync formData whenever the selected attendance row changes
  useEffect(() => {
    if (attendance) {
      setFormData({
        attendanceId: attendance.attendanceId,
        individualComments: attendance.individualComments ?? "",
        freeskiRuns: toFieldValue(attendance.freeskiRuns),
        drillRuns: toFieldValue(attendance.drillRuns),
        educationalCourseRuns: toFieldValue(attendance.educationalCourseRuns),
        raceTrainingCourseRuns: toFieldValue(attendance.raceTrainingCourseRuns),
        raceRuns: toFieldValue(attendance.raceRuns),
      });
    }
  }, [attendance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Attendance = {
      attendanceId: formData.attendanceId,
      individualComments: formData.individualComments,
      freeskiRuns: formData.freeskiRuns === "" ? null : Number(formData.freeskiRuns),
      drillRuns: formData.drillRuns === "" ? null : Number(formData.drillRuns),
      educationalCourseRuns:
        formData.educationalCourseRuns === "" ? null : Number(formData.educationalCourseRuns),
      raceTrainingCourseRuns:
        formData.raceTrainingCourseRuns === "" ? null : Number(formData.raceTrainingCourseRuns),
      raceRuns: formData.raceRuns === "" ? null : Number(formData.raceRuns),
    };

    console.log("Submitting formData:", updated);
    onSubmit(updated);
  };

  return (
    <div className="edit-attendance-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">Edit Attendance</h2>
        <div className="white-box">
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Freeski Runs: </label>
              <input
                type="number"
                min="0"
                name="freeskiRuns"
                value={formData.freeskiRuns}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Drill Runs: </label>
              <input
                type="number"
                min="0"
                name="drillRuns"
                value={formData.drillRuns}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Educational Course Runs: </label>
              <input
                type="number"
                min="0"
                name="educationalCourseRuns"
                value={formData.educationalCourseRuns}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Race Training Course Runs: </label>
              <input
                type="number"
                min="0"
                name="raceTrainingCourseRuns"
                value={formData.raceTrainingCourseRuns}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Race Runs: </label>
              <input
                type="number"
                min="0"
                name="raceRuns"
                value={formData.raceRuns}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Individual Comment: </label>
              <input
                name="individualComments"
                value={formData.individualComments}
                onChange={handleChange}
              />
            </div>

            <button type="submit">Save</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceForm;