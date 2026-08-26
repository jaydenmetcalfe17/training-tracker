// components/EditAthleteForm.tsx

import { useEffect, useState } from "react";
import type { Athlete } from "../../types/Athlete";
import type { Club } from "../../types/Club";
import type { Team } from "../../types/Team";

interface EditAthleteFormProps {
  athlete: Athlete | null;
  onSubmit: (athlete: Athlete) => void;
}

const EditAthleteForm: React.FC<
  EditAthleteFormProps
> = ({ athlete, onSubmit }) => {
  const [formData, setFormData] = useState({
    athleteFirstName: "",
    athleteLastName: "",
    birthday: "",
    gender: "",
    acaId: "",
    fisId: "",
    ageGroup: "",
    clubId: "",
    teamId: "",
  });

  const [clubs, setClubs] = useState<Club[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  // Load clubs
  useEffect(() => {
    fetch("/api/clubs")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load clubs");
        }

        return res.json();
      })
      .then((data) => {
        const loadedClubs: Club[] = data.map(
          (club: any) => ({
            clubId: club.club_id,
            name: club.name,
          })
        );

        setClubs(loadedClubs);
      })
      .catch((err) => {
        console.error(
          "Unable to load clubs:",
          err
        );
      });
  }, []);

  // Sync form data whenever athlete changes
  useEffect(() => {
    if (!athlete) {
      return;
    }

    const currentMembership =
      athlete.teamMemberships?.find(
        (membership) =>
          membership.endDate == null
      );

    const currentTeam =
      currentMembership?.team;

    const currentClub =
      currentTeam?.club;

    setFormData({
      athleteFirstName:
        athlete.athleteFirstName,

      athleteLastName:
        athlete.athleteLastName,

      birthday: athlete.birthday
        ? new Date(
            athlete.birthday
          )
            .toISOString()
            .slice(0, 10)
        : "",

      gender:
        athlete.gender,

      acaId:
        athlete.acaId != null
          ? athlete.acaId.toString()
          : "",

      fisId:
        athlete.fisId != null
          ? athlete.fisId.toString()
          : "",

      ageGroup:
        athlete.ageGroup ?? "",

      clubId:
        currentClub?.clubId != null
          ? currentClub.clubId.toString()
          : "",

      teamId:
        currentTeam?.teamId != null
          ? currentTeam.teamId.toString()
          : "",
    });
  }, [athlete]);

  // Load teams whenever the selected club changes
  useEffect(() => {
    if (!formData.clubId) {
      setTeams([]);
      return;
    }

    fetch(
      `/api/teams?clubId=${formData.clubId}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Failed to load teams"
          );
        }

        return res.json();
      })
      .then((data) => {
        const loadedTeams: Team[] =
          data.map((team: any) => ({
            teamId: team.team_id,
            clubId: team.club_id,
            name: team.name,
          }));

        setTeams(loadedTeams);
      })
      .catch((err) => {
        console.error(
          "Unable to load teams:",
          err
        );

        setTeams([]);
      });
  }, [formData.clubId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "clubId"
        ? { teamId: "" }
        : {}),
    }));
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!athlete) {
      return;
    }

    const updatedAthlete = {
      ...athlete,

      athleteFirstName:
        formData.athleteFirstName,

      athleteLastName:
        formData.athleteLastName,

      birthday:
        formData.birthday,

      gender:
        formData.gender,

      acaId:
        formData.acaId
          ? Number(formData.acaId)
          : null,

      fisId:
        formData.fisId
          ? Number(formData.fisId)
          : null,

      ageGroup:
        formData.ageGroup || null,

      teamId:
        Number(formData.teamId),
    };

    console.log(
      "Submitting updated athlete:",
      updatedAthlete
    );

    onSubmit(updatedAthlete);
  };

  return (
    <div className="edit-athlete-form">
      <h2>Edit Athlete</h2>

      <form onSubmit={handleSubmit}>

        {/* First Name */}
        <div className="form-group">
          <label>
            First Name:
          </label>

          <input
            type="text"
            required
            name="athleteFirstName"
            value={
              formData.athleteFirstName
            }
            onChange={handleChange}
          />
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label>
            Last Name:
          </label>

          <input
            type="text"
            required
            name="athleteLastName"
            value={
              formData.athleteLastName
            }
            onChange={handleChange}
          />
        </div>

        {/* Birthday */}
        <div className="form-group">
          <label>
            Birthday:
          </label>

          <input
            type="date"
            required
            name="birthday"
            value={
              formData.birthday
            }
            onChange={handleChange}
          />
        </div>

        {/* Gender */}
        <div className="form-group">
          <label>
            Gender:
          </label>

          <select
            required
            name="gender"
            value={
              formData.gender
            }
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
        </div>

        {/* ACA ID */}
        <div className="form-group">
          <label>
            ACA ID:
          </label>

          <input
            type="number"
            name="acaId"
            value={
              formData.acaId
            }
            onChange={handleChange}
          />
        </div>

        {/* FIS ID */}
        <div className="form-group">
          <label>
            FIS ID:
          </label>

          <input
            type="number"
            name="fisId"
            value={
              formData.fisId
            }
            onChange={handleChange}
          />
        </div>

        {/* Club */}
        <div className="form-group">
          <label>
            Club:
          </label>

          <select
            required
            name="clubId"
            value={
              formData.clubId
            }
            onChange={handleChange}
          >
            <option value="">
              Select club
            </option>

            {clubs.map((club) => (
              <option
                key={club.clubId}
                value={club.clubId}
              >
                {club.name}
              </option>
            ))}
          </select>
        </div>

        {/* Team */}
        <div className="form-group">
          <label>
            Team:
          </label>

          <select
            required
            name="teamId"
            value={
              formData.teamId
            }
            onChange={handleChange}
            disabled={!formData.clubId}
          >
            <option value="">
              {formData.clubId
                ? "Select team"
                : "Select a club first"}
            </option>

            {teams.map((team) => (
              <option
                key={team.teamId}
                value={team.teamId}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Age Group */}
        <div className="form-group">
          <label>
            Age Group:
          </label>

          <select
            required
            name="ageGroup"
            value={
              formData.ageGroup
            }
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
        </div>

        <button
          type="submit"
          className="main-button"
        >
          Save Changes
        </button>

      </form>
    </div>
  );
};

export default EditAthleteForm;