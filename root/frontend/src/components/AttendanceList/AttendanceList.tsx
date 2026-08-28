// components/AttendanceList/AttendanceList.tsx

import { useContext, useEffect, useState } from "react";
import type { Session } from "../../types/Session";
import type { Athlete } from "../../types/Athlete";
import MultiSelectEx from "../Multiselect/Multiselect";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './AttendanceList.scss';
import type { Attendance } from "../../types/Attendance";
import type { TeamMembership } from "../../types/TeamMembership";
import type { Team } from "../../types/Team";
import AuthContext from "../../context/AuthContext";
import EditAttendanceForm from "../EditAttendanceForm/EditAttendanceForm";

interface AttendanceListProps {
  session: Session;
}

const AttendanceList: React.FC<AttendanceListProps> = ({ session }) => {
  const { user } = useContext(AuthContext);
  const isVisible = (user?.status === 'coach');

  const [attendance, setAttendance] = useState<Attendance[]>(
    session.receivedAttendance ?? []
  );

  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([]);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showEditAttendancePopup, setShowEditAttendancePopup] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);

  useEffect(() => {
    fetch(`/api/athlete`)
      .then(res => res.json())
      .then(data => {
        const mappedAthletes: Athlete[] = data.map((athlete: any) => ({
          athleteId: athlete.athlete_id,
          athleteFirstName: athlete.athlete_first_name,
          athleteLastName: athlete.athlete_last_name,
          birthday: athlete.birthday,
          gender: athlete.gender,
          acaId: athlete.aca_id,
          fisId: athlete.fis_id,
          ageGroup: athlete.age_group,

          teamMemberships: athlete.team_memberships?.map(
            (membership: any): TeamMembership => ({
              teamMembershipId: membership.team_membership_id,
              athleteId: membership.athlete_id,
              teamId: membership.team_id,
              startDate: membership.start_date,
              endDate: membership.end_date,

              team: membership.team
                ? ({
                    teamId: membership.team.team_id,
                    clubId: membership.team.club_id,
                    name: membership.team.name,
                    club: membership.team.club,
                  } as Team)
                : undefined,
            })
          ),
        }));

        const attendanceIds = attendance.map(
          a => a.athlete?.athleteId
        );

        const includeThem = mappedAthletes.filter(
          athlete =>
            !attendanceIds.includes(athlete.athleteId)
        );

        setAvailableAthletes(includeThem);
      })
      .catch(err =>
        console.error('Failed to load athletes', err)
      );
  }, [user]);

  useEffect(() => {
    const attendanceIds = attendance.map(a => a.athlete!.athleteId);
    setAvailableAthletes(prev => prev.filter(a => !attendanceIds.includes(a.athleteId)));
  }, [attendance]);

  const toggleEditPopup = () => setShowEditPopup(!showEditPopup);
  const toggleEditAttendancePopup = () => setShowEditAttendancePopup(!showEditAttendancePopup);

  const handleAttendanceChange = (selectedIds: number[]) => {
    fetch(`/api/attendance/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.sessionId, athleteIds: selectedIds }),
    })
      .then(res => res.json())
      .then(() => {
        const newAttendance: Attendance[] = selectedIds.map(id => {
          const athlete = availableAthletes.find(a => a.athleteId === id)!;
          return { attendanceId: Date.now() + id, athlete, individualComments: "" };
        });
        setAttendance(prev => [...prev, ...newAttendance]);
      })
      .catch(err => console.error('Failed to add athlete attendance', err));

    toggleEditPopup();
  };

  const deleteAthleteAttendance = (athleteId: number) => {
    fetch(`/api/attendance/${athleteId}/${session.sessionId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => {
        setAttendance(prev => prev.filter(a => a.athlete!.athleteId !== athleteId));
      })
      .catch(err => console.error('Failed to delete athlete attendance', err));
  };

  const editAttendance = (updatedAttendance: Attendance) => {
    if (!updatedAttendance.attendanceId) return;

    fetch(`/api/attendance/${updatedAttendance.attendanceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        individualComments: updatedAttendance.individualComments,
        freeskiRuns: updatedAttendance.freeskiRuns,
        drillRuns: updatedAttendance.drillRuns,
        educationalCourseRuns: updatedAttendance.educationalCourseRuns,
        raceTrainingCourseRuns: updatedAttendance.raceTrainingCourseRuns,
        raceRuns: updatedAttendance.raceRuns,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to update attendance: ${res.status}`);
        }
        return res.json();
      })
      .then(() => {
        setAttendance(prev =>
          prev.map(a =>
            a.attendanceId === updatedAttendance.attendanceId
              ? { ...a, ...updatedAttendance }
              : a
          )
        );
      })
      .catch(err => console.error('Failed to update attendance', err));

    toggleEditAttendancePopup();
  };

  const getAttendanceTeams = (athlete: Athlete) => {
    const sessionTeamIds = session.teamIds ?? [];

    const sessionClubIds = new Set(
      athlete.teamMemberships
        ?.filter((membership) =>
          sessionTeamIds.includes(membership.teamId)
        )
        .map((membership) => membership.team?.clubId)
        .filter((clubId): clubId is number => clubId != null)
    );

    return athlete.teamMemberships
      ?.filter((membership) => {
        const sessionDate = session.sessionDay;

        if (!membership.startDate || !sessionDate) {
          return false;
        }

        const activeOnSessionDate =
          membership.startDate <= sessionDate &&
          (
            membership.endDate == null ||
            membership.endDate >= sessionDate
          );

        const belongsToSessionClub =
          membership.team?.clubId != null &&
          sessionClubIds.has(membership.team.clubId);

        return (
          activeOnSessionDate &&
          belongsToSessionClub
        );
      })
      .map((membership) => membership.team?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="attendance-list-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">Attendance</h2>
        <div className="white-box" id="attendance-white-box">
          <button className="main-button" id="add-athlete-attendance-button" data-testid="add-attendance-button" onClick={toggleEditPopup}>
            Add Athlete to Attendance
          </button>

          {showEditPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <MultiSelectEx athletes={availableAthletes} type="athlete" onChange={handleAttendanceChange} />
              </div>
            </div>
          )}

          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Team</th>
                <th>Freeski</th>
                <th>Drill</th>
                <th>Ed. Course</th>
                <th>Race Training</th>
                <th>Race</th>
                <th>Individual Comments</th>
                {isVisible && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.attendanceId}>
                  <td>{a.athlete!.athleteFirstName}</td>
                  <td>{a.athlete!.athleteLastName}</td>
                  <td>
                    {getAttendanceTeams(a.athlete!)}
                  </td>
                  <td>{a.freeskiRuns ?? 0}</td>
                  <td>{a.drillRuns ?? 0}</td>
                  <td>{a.educationalCourseRuns ?? 0}</td>
                  <td>{a.raceTrainingCourseRuns ?? 0}</td>
                  <td>{a.raceRuns ?? 0}</td>
                  <td>{a.individualComments}</td>
                  {isVisible && (
                    <td className="button-box">
                      <button
                        className="main-button"
                        id="edit-button"
                        data-testid="edit-button"
                        aria-label="edit-button"
                        onClick={() => {
                          setSelectedAttendance(a);
                          toggleEditAttendancePopup();
                        }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="main-button"
                        id="delete-button"
                        aria-label="delete-button"
                        data-testid="delete-button"
                        onClick={() => deleteAthleteAttendance(a.athlete!.athleteId!)}
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {showEditAttendancePopup && selectedAttendance && (
            <div className="popup-overlay" id="popup-attendance">
              <div className="popup-content">
                <EditAttendanceForm attendance={selectedAttendance} onSubmit={editAttendance} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;