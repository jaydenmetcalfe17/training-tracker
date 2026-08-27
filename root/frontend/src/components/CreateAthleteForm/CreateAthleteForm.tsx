// components/CreateAthleteForm/CreateAthleteForm.tsx

import { useEffect, useState } from 'react';
import type { CreateAthleteRequest } from '../../types/CreateAthleteRequest';
import type { Club } from '../../types/Club';
import type { Team } from '../../types/Team';
import './CreateAthleteForm.scss';

interface AthleteFormProps {
  onSubmit: (athlete: CreateAthleteRequest) => void;
  clubId?: number;
}

const CreateAthleteForm: React.FC<AthleteFormProps> = ({
  onSubmit,
  clubId,
}) => {
  const [formData, setFormData] = useState({
    athleteFirstName: '',
    athleteLastName: '',
    birthday: '',
    gender: '',
    acaId: '',
    fisId: '',
    ageGroup: '',
    clubId: clubId ? String(clubId) : '',
    teamId: '',
  });

  const [clubs, setClubs] = useState<Club[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ----------------------------------------
  // Load clubs
  // ----------------------------------------

  useEffect(() => {
    fetch('/api/clubs')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load clubs');
        }

        return res.json();
      })
      .then((data) => {
        console.log('CLUB DATA:', data);

        const loadedClubs: Club[] = data.map((club: any) => ({
          clubId: club.clubId,
          name: club.name,
          teams: club.teams ?? [],
        }));

        setClubs(loadedClubs);
      })
      .catch((err) => {
        console.error('Unable to load clubs:', err);
      });
  }, []);

  // ----------------------------------------
  // If we're on a specific team page, automatically determine its club.
  // ----------------------------------------

  useEffect(() => {
    if (clubId) {
      setFormData((prev) => ({
        ...prev,
        clubId: String(clubId),
        teamId: '',
      }));
    }
  }, [clubId]);

  // ----------------------------------------
  // Load teams whenever a club is selected
  // ----------------------------------------

  useEffect(() => {
    if (!formData.clubId) {
      setTeams([]);
      return;
    }

    fetch(`/api/teams?clubId=${formData.clubId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load teams');
        }

        return res.json();
      })
      .then((data) => {
        console.log('TEAM DATA:', data);

        const loadedTeams: Team[] = data.map((team: any) => ({
          teamId: team.team_id,
          clubId: team.club_id,
          name: team.name,
        }));

        setTeams(loadedTeams);
      })
      .catch((err) => {
        console.error('Unable to load teams:', err);
        setTeams([]);
      });
  }, [formData.clubId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let errorMessage = '';

    // Gender validation
    if (name === 'gender') {
      const allowedGenders = ['Male', 'Female'];

      if (!allowedGenders.includes(value)) {
        errorMessage = 'Please enter Male or Female.';
      }
    }

    // Age group validation
    if (name === 'ageGroup') {
      const allowedAgeGroups = [
        'U10',
        'U12',
        'U14',
        'U16',
        'FIS',
      ];

      if (!allowedAgeGroups.includes(value)) {
        errorMessage = 'Please enter a valid age group.';
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: value,

      // Changing clubs clears the selected team.
      ...(name === 'clubId'
        ? { teamId: '' }
        : {}),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Make sure a team is selected
    if (!formData.teamId) {
      setErrors((prev) => ({
        ...prev,
        teamId: 'Please select a team.',
      }));

      return;
    }

    const newAthlete: CreateAthleteRequest = {
      athleteFirstName: formData.athleteFirstName,
      athleteLastName: formData.athleteLastName,
      birthday: formData.birthday,
      gender: formData.gender,

      acaId: formData.acaId
        ? Number(formData.acaId)
        : undefined,

      fisId: formData.fisId
        ? Number(formData.fisId)
        : undefined,

      ageGroup: formData.ageGroup || undefined,

      clubId: formData.clubId
        ? Number(formData.clubId)
        : undefined,

      teamId: formData.teamId
        ? Number(formData.teamId)
        : undefined,
    };

    console.log(
      'ATHLETE CREATION REQUEST:',
      newAthlete
    );

    onSubmit(newAthlete);

    // Reset form
    setFormData({
      athleteFirstName: '',
      athleteLastName: '',
      birthday: '',
      gender: '',
      acaId: '',
      fisId: '',
      ageGroup: '',
      clubId: '',
      teamId: '',
    });

    setTeams([]);
    setErrors({});
  };

  return (
    <div className="create-athlete-box">
      <div className="light-tan-box">
        <h2 className="box-h2-title">Create Athlete</h2>
        <div className="white-box">
          <form className="create-athlete-form" onSubmit={handleSubmit}>
            <div className="one-column-form">
              {/* First Name */}
              <div className="form-group">
                <label>First Name: </label>

                <input
                  type="text"
                  required
                  name="athleteFirstName"
                  value={formData.athleteFirstName}
                  onChange={handleChange}
                />
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label>Last Name: </label>

                <input
                  type="text"
                  required
                  name="athleteLastName"
                  value={formData.athleteLastName}
                  onChange={handleChange}
                />
              </div>

              {/* Birthday */}
              <div className="form-group">
                <label>Birthday: </label>

                <input
                  required
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label>Gender: </label>

                <select
                  required
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>
                </select>

                {errors.gender && (
                  <p className="error-text">
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* ACA ID */}
              <div className="form-group">
                <label>ACA ID: </label>

                <input
                  type="number"
                  name="acaId"
                  value={formData.acaId}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              {/* FIS ID */}
              <div className="form-group">
                <label>FIS ID: </label>

                <input
                  type="number"
                  name="fisId"
                  value={formData.fisId}
                  onChange={handleChange}
                  placeholder="Optional"
                />
              </div>

              {/* Club */}
              <div className="form-group">
                <label>Club: </label>

                <select
                  required
                  name="clubId"
                  value={formData.clubId}
                  onChange={handleChange}
                  disabled={!!clubId}
                >
                  <option value="">
                    Select club
                  </option>

                  {clubs.map((club) => (
                    <option
                      key={`club-${club.clubId}-${club.name}`}
                      value={String(club.clubId)}
                    >
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team */}
              <div className="form-group">
                <label>Team: </label>

                <select
                  required
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleChange}
                  disabled={!formData.clubId}
                >
                  <option value="">
                    {formData.clubId
                      ? 'Select team'
                      : 'Select a club first'}
                  </option>

                  {teams.map((team) => (
                    <option
                      key={`team-${team.teamId}-${team.name}`}
                      value={team.teamId}
                    >
                      {team.name}
                    </option>
                  ))}
                </select>

                {errors.teamId && (
                  <p className="error-text">
                    {errors.teamId}
                  </p>
                )}
              </div>

              {/* Age Group */}
              {/* <div className="form-group">
                <label>Age Group: </label>

                <select
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                >
                  <option value="">
                    Select age group
                  </option>

                  <option value="U10">
                    U10
                  </option>

                  <option value="U12">
                    U12
                  </option>

                  <option value="U14">
                    U14
                  </option>

                  <option value="U16">
                    U16
                  </option>

                  <option value="FIS">
                    FIS
                  </option>
                </select>

                {errors.ageGroup && (
                  <p className="error-text">
                    {errors.ageGroup}
                  </p>
                )}
              </div> */}

              {/* Submit */}
              <button
                type="submit"
                className="main-button"
                id="create-athlete-profile-button"
              >
                Create Athlete Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAthleteForm;