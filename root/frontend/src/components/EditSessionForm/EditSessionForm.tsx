// components/EditSessionForm.tsx

import { useContext, useEffect, useState } from 'react';
import type { Session } from "../../types/Session";
import type { Athlete } from '../../types/Athlete';
import type { Team } from '../../types/Team';
import MultiSelectEx from '../Multiselect/Multiselect';
import AuthContext from '../../context/AuthContext';

interface EditSessionFormProps {
  session: Session | null;
  onSubmit: (session: Session) => void;
}

const EditSessionForm: React.FC<EditSessionFormProps> = ({
  session,
  onSubmit,
}) => {
  const { user } = useContext(AuthContext);

  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);

  const [selectedAthletes, setSelectedAthletes] = useState<number[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);

  const [formData, setFormData] = useState<Session>({
    sessionDay: '',
    startTime: '',
    endTime: '',
    location: '',
    discipline: '',
    snowConditions: '',
    visConditions: '',
    terrainType: '',
    numFreeskiRuns: 0,
    numDrillRuns: 0,
    numEducationalCourseRuns: 0,
    numGatesEducationalCourse: 0,
    numRaceTrainingCourseRuns: 0,
    numGatesRaceTrainingCourse: 0,
    numRaceRuns: 0,
    numGatesRace: 0,
    generalComments: '',
    attendance: [],
    teamIds: [],
  });

  // --------------------------------------------------
  // Load athletes with their FULL team membership history
  // --------------------------------------------------

  useEffect(() => {
    fetch(`/api/athlete`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load athletes: ${res.status}`);
        }

        return res.json();
      })
      .then((data) => {
        const mappedAthletes: Athlete[] = data.map((athlete: any) => ({
          athleteId: athlete.athlete_id,
          athleteFirstName: athlete.athlete_first_name,
          athleteLastName: athlete.athlete_last_name,
          birthday: athlete.birthday,
          gender: athlete.gender,
          acaId: athlete.aca_id,
          fisId: athlete.fis_id,
          ageGroup: athlete.age_group,

          // IMPORTANT:
          // Keep the full membership history here.
          // MultiSelectEx will determine which ones are current.
          teamMemberships: athlete.team_memberships?.map(
            (membership: any) => ({
              teamMembershipId:
                membership.team_membership_id,

              athleteId:
                membership.athlete_id,

              teamId:
                membership.team_id,

              startDate:
                membership.start_date,

              endDate:
                membership.end_date,

              team: membership.team
                ? {
                    teamId:
                      membership.team.team_id,

                    clubId:
                      membership.team.club_id,

                    name:
                      membership.team.name,

                    club:
                      membership.team.club,
                  }
                : undefined,
            })
          ),
        }));

        console.log(
          "Edit session athletes with memberships:",
          mappedAthletes
        );

        setAvailableAthletes(mappedAthletes);
      })
      .catch((err) =>
        console.error(
          'Failed to load athletes',
          err
        )
      );
  }, []);

  // --------------------------------------------------
  // Load teams belonging to the current coach
  // --------------------------------------------------

  useEffect(() => {
    if (!user?.userId) {
      return;
    }

    fetch(`/api/teams?coachId=${user.userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to load teams: ${res.status}`
          );
        }

        return res.json();
      })
      .then((data) => {
        const mappedTeams: Team[] = data.map(
          (team: any) => ({
            teamId: team.team_id,
            clubId: team.club_id,
            name: team.name,
            club: team.club,
          })
        );

        console.log(
          "Edit session teams:",
          mappedTeams
        );

        setAvailableTeams(mappedTeams);
      })
      .catch((err) =>
        console.error(
          "Failed to load teams:",
          err
        )
      );
  }, [user]);

  // --------------------------------------------------
  // Populate form when session is loaded
  // --------------------------------------------------

  useEffect(() => {
    if (!session) {
      return;
    }

    const attendanceIds = Array.isArray(session.attendance)
      ? session.attendance.map((athlete: any) => {
          // If attendance is already an array of IDs
          if (typeof athlete === "number") {
            return athlete;
          }

          // If attendance contains Athlete objects
          return athlete?.athleteId;
        }).filter(
          (id): id is number =>
            typeof id === "number"
        )
      : [];

    const teamIds = session.teamIds ?? [];

    setFormData({
      sessionId: session.sessionId,

      sessionDay: session.sessionDay
        ? new Date(session.sessionDay)
            .toISOString()
            .slice(0, 10)
        : "",

      startTime: session.startTime ?? '',
      endTime: session.endTime ?? '',
      location: session.location ?? '',
      discipline: session.discipline ?? '',
      snowConditions: session.snowConditions ?? '',
      visConditions: session.visConditions ?? '',
      terrainType: session.terrainType ?? '',

      numFreeskiRuns:
        session.numFreeskiRuns ?? 0,

      numDrillRuns:
        session.numDrillRuns ?? 0,

      numEducationalCourseRuns:
        session.numEducationalCourseRuns ?? 0,

      numGatesEducationalCourse:
        session.numGatesEducationalCourse ?? 0,

      numRaceTrainingCourseRuns:
        session.numRaceTrainingCourseRuns ?? 0,

      numGatesRaceTrainingCourse:
        session.numGatesRaceTrainingCourse ?? 0,

      numRaceRuns:
        session.numRaceRuns ?? 0,

      numGatesRace:
        session.numGatesRace ?? 0,

      generalComments:
        session.generalComments ?? '',

      attendance: attendanceIds,

      teamIds: teamIds,
    });

    setSelectedAthletes(attendanceIds);
    setSelectedTeams(teamIds);
  }, [session]);

  // --------------------------------------------------
  // Handle normal input changes
  // --------------------------------------------------

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name.startsWith('num')
          ? Number(value)
          : value,
    }));
  };

  // --------------------------------------------------
  // Handle athlete selection -- removed this from the form for now. but note to self: wasn't adding properly
  // --------------------------------------------------

  const handleAttendanceChange = (
    selectedIds: number[]
  ) => {
    setSelectedAthletes(selectedIds);

    setFormData((prev) => ({
      ...prev,
      attendance: selectedIds,
    }));
  };

  // --------------------------------------------------
  // Handle team selection
  // --------------------------------------------------

  const handleTeamChange = (
    selectedIds: number[]
  ) => {
    setSelectedTeams(selectedIds);

    setFormData((prev) => ({
      ...prev,
      teamIds: selectedIds,
    }));
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const updatedSession: Session = {
      ...formData,

      attendance: selectedAthletes,

      teamIds: selectedTeams,
    };

    console.log(
      "Submitting updated session:",
      updatedSession
    );

    onSubmit(updatedSession);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">

        <h2>Edit Session</h2>

        <form onSubmit={handleSubmit}>

          {/* Teams */}

          <div className="form-group">
            <label>Teams:</label>

            <MultiSelectEx
              teams={availableTeams}
              type="team"
              onChange={handleTeamChange}
            />
          </div>

          {/* Attendance */}

          {/* <div className="form-group">
            <label>Attendance:</label>

            <MultiSelectEx
              athletes={availableAthletes}
              type="athlete"
              onChange={handleAttendanceChange}
            />
          </div> */}

          {/* Session Date */}

          <div className="form-group">
            <label>Session Date:</label>

            <input
              required
              name="sessionDay"
              type="date"
              value={formData.sessionDay}
              onChange={handleChange}
            />
          </div>

          {/* Start Time */}

          <div className="form-group">
            <label>Start Time:</label>

            <input
              required
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
            />
          </div>

          {/* End Time */}

          <div className="form-group">
            <label>End Time:</label>

            <input
              required
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>

          {/* Location */}

          <div className="form-group">
            <label>Location:</label>

            <input
              required
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {/* Discipline */}

          <div className="form-group">
            <label>Discipline:</label>

            <input
              required
              name="discipline"
              list="discipline"
              value={formData.discipline}
              onChange={handleChange}
            />

            <datalist id="discipline">
              <option value="SL" />
              <option value="GS" />
              <option value="SG" />
              <option value="DH" />
              <option value="Other" />
            </datalist>
          </div>

          {/* Snow Conditions */}

          <div className="form-group">
            <label>Snow Conditions:</label>

            <input
              required
              name="snowConditions"
              list="snowConditions"
              value={formData.snowConditions}
              onChange={handleChange}
            />

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

          {/* Visibility */}

          <div className="form-group">
            <label>Visibility Conditions:</label>

            <input
              required
              name="visConditions"
              list="visConditions"
              value={formData.visConditions}
              onChange={handleChange}
            />

            <datalist id="visConditions">
              <option value="Sunny" />
              <option value="Flat light" />
              <option value="Fog" />
              <option value="Snowing" />
              <option value="Variable" />
              <option value="Rain" />
            </datalist>
          </div>

          {/* Terrain */}

          <div className="form-group">
            <label>Terrain Type:</label>

            <input
              required
              name="terrainType"
              list="terrainType"
              value={formData.terrainType}
              onChange={handleChange}
            />

            <datalist id="terrainType">
              <option value="Flat" />
              <option value="Medium" />
              <option value="Steep" />
              <option value="Rolly" />
              <option value="Mixed" />
            </datalist>
          </div>

          {/* Freeski Runs */}

          <div className="form-group">
            <label># of Freeski Runs:</label>

            <input
              required
              name="numFreeskiRuns"
              type="number"
              value={formData.numFreeskiRuns}
              onChange={handleChange}
            />
          </div>

          {/* Drill Runs */}

          <div className="form-group">
            <label># of Drill Runs:</label>

            <input
              required
              name="numDrillRuns"
              type="number"
              value={formData.numDrillRuns}
              onChange={handleChange}
            />
          </div>

          {/* Educational Course Runs */}

          <div className="form-group">
            <label>
              # of Educational Course Runs:
            </label>

            <input
              required
              name="numEducationalCourseRuns"
              type="number"
              value={
                formData.numEducationalCourseRuns
              }
              onChange={handleChange}
            />
          </div>

          {/* Educational Course Gates */}

          <div className="form-group">
            <label>
              # of Gates in Educational Course:
            </label>

            <input
              required
              name="numGatesEducationalCourse"
              type="number"
              value={
                formData.numGatesEducationalCourse
              }
              onChange={handleChange}
            />
          </div>

          {/* Race Training Course Runs */}

          <div className="form-group">
            <label>
              # of Race Training Course Runs:
            </label>

            <input
              required
              name="numRaceTrainingCourseRuns"
              type="number"
              value={
                formData.numRaceTrainingCourseRuns
              }
              onChange={handleChange}
            />
          </div>

          {/* Race Training Course Gates */}

          <div className="form-group">
            <label>
              # of Gates in Race Training Course:
            </label>

            <input
              required
              name="numGatesRaceTrainingCourse"
              type="number"
              value={
                formData.numGatesRaceTrainingCourse
              }
              onChange={handleChange}
            />
          </div>

          {/* Race Runs */}

          <div className="form-group">
            <label># of Race Runs:</label>

            <input
              required
              name="numRaceRuns"
              type="number"
              value={formData.numRaceRuns}
              onChange={handleChange}
            />
          </div>

          {/* Race Gates */}

          <div className="form-group">
            <label># of Gates in Race Course:</label>

            <input
              required
              name="numGatesRace"
              type="number"
              value={formData.numGatesRace}
              onChange={handleChange}
            />
          </div>

          {/* General Comments */}

          <div className="form-group">
            <label>General Comments:</label>

            <input
              name="generalComments"
              type="text"
              value={formData.generalComments}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}

          <div className="center-button">
            <button
              type="submit"
              className="main-button"
              id="edit-session-button"
            >
              Edit Session
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditSessionForm;