// components/AthleteAffiliations/AthleteAffiliations.tsx

import { useEffect, useState } from "react";

import type { Team } from "../../types/Team";
import type { TeamMembership } from "../../types/TeamMembership";

import "./AthleteAffiliations.scss";

interface AthleteAffiliationsProps {
  athleteId: number;
  isCoach: boolean;
}

interface MembershipUpdate {
  teamMembershipId?: number;
  teamId: number;
  startDate: string;
  endDate: string;
}

const AthleteAffiliations: React.FC<AthleteAffiliationsProps> = ({
  athleteId,
  isCoach,
}) => {
  const [memberships, setMemberships] = useState<TeamMembership[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [editing, setEditing] = useState(false);
  const [updates, setUpdates] = useState<MembershipUpdate[]>([]);
  const [newTeamId, setNewTeamId] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================================================
  // GET ATHLETE MEMBERSHIPS
  // ==================================================

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/athlete/${athleteId}/team-memberships`
      );

      if (!response.ok) {
        throw new Error("Failed to load athlete affiliations");
      }

      const data: TeamMembership[] = await response.json();

      setMemberships(data);
    } catch (error) {
      console.error("Failed to load affiliations:", error);

      setError("Failed to load affiliations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, [athleteId]);

  // ==================================================
  // GET TEAMS THE COACH CAN EDIT
  // ==================================================

  useEffect(() => {
    if (!isCoach) {
      return;
    }

    const fetchAvailableTeams = async () => {
      try {
        const response = await fetch("/api/teams");

        if (!response.ok) {
          throw new Error("Failed to load teams");
        }

        const data = await response.json();

        const mappedTeams: Team[] = data.map((team: any) => ({
          teamId: team.team_id,
          clubId: team.club_id,
          name: team.name,
          club: team.club,
        }));

        setAvailableTeams(mappedTeams);
      } catch (error) {
        console.error(
          "Failed to load available teams:",
          error
        );

        setError("Failed to load teams you can edit.");
      }
    };

    fetchAvailableTeams();
  }, [isCoach]);

  // ==================================================
  // CURRENT MEMBERSHIPS
  // ==================================================

  const currentMemberships = memberships.filter(
    (membership) => !membership.endDate
  );

  // ==================================================
  // HISTORICAL MEMBERSHIPS
  // ==================================================

  const pastMemberships = memberships.filter(
    (membership) => !!membership.endDate
  );

  // ==================================================
  // START EDITING
  // ==================================================

  const startEditing = () => {
    if (!isCoach) {
        return;
    }

    const editableTeamIds = new Set(
        availableTeams
        .map((team) => team.teamId)
        .filter(
            (teamId): teamId is number =>
            teamId !== undefined
        )
    );

    const editableMemberships =
        currentMemberships.filter(
        (membership) =>
            editableTeamIds.has(
            membership.teamId
            )
        );

    const editableUpdates: MembershipUpdate[] =
        editableMemberships.map(
        (membership) => ({
            teamMembershipId:
            membership.teamMembershipId,

            teamId:
            membership.teamId,

            startDate:
            membership.startDate
                ? membership.startDate.substring(0, 10)
                : "",

            endDate:
            membership.endDate
                ? membership.endDate.substring(0, 10)
                : "",
        })
        );

    setUpdates(editableUpdates);

    setNewTeamId("");
    setNewStartDate("");

    setError(null);
    setEditing(true);
    };

  // ==================================================
  // CANCEL EDITING
  // ==================================================

  const cancelEditing = () => {
    setEditing(false);

    setUpdates([]);

    setNewTeamId("");
    setNewStartDate("");

    setError(null);
  };

  // ==================================================
  // UPDATE EXISTING MEMBERSHIP
  // ==================================================

  const updateMembershipDate = (
    index: number,
    field: "startDate" | "endDate",
    value: string
  ) => {
    setUpdates((current) =>
      current.map((membership, i) =>
        i === index
          ? {
              ...membership,
              [field]: value,
            }
          : membership
      )
    );
  };

  // ==================================================
  // ADD NEW TEAM
  // ==================================================

  const addTeam = () => {
    if (!newTeamId) {
      return;
    }

    const teamId = Number(newTeamId);

    if (!Number.isInteger(teamId)) {
      return;
    }

    const selectedTeam = availableTeams.find(
      (team) => team.teamId === teamId
    );

    if (!selectedTeam) {
      setError(
        "You do not have permission to add this team."
      );

      return;
    }

    const alreadyExists = memberships.some(
      (membership) =>
        membership.teamId === teamId &&
        !membership.endDate
    );

    if (alreadyExists) {
      setError(
        "The athlete is already on this team."
      );

      return;
    }

    if (!newStartDate) {
      setError("Please select a start date.");

      return;
    }

    setUpdates((current) => [
      ...current,
      {
        teamId,
        startDate: newStartDate,
        endDate: "",
      },
    ]);

    setNewTeamId("");
    setNewStartDate("");
    setError(null);
  };

  // ==================================================
  // SAVE
  // ==================================================

  const saveAffiliations = async () => {
    try {
        setSaving(true);
        setError(null);

        const editableTeamIds = new Set(
        availableTeams
            .map((team) => team.teamId)
            .filter(
            (teamId): teamId is number =>
                teamId !== undefined
            )
        );

        const authorizedUpdates =
        updates.filter(
            (membership) =>
            editableTeamIds.has(
                membership.teamId
            )
        );

        const response = await fetch(
        `/api/athlete/${athleteId}/team-memberships`,
        {
            method: "PUT",

            headers: {
            "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
            memberships:
                authorizedUpdates,
            }),
        }
        );

        const data = await response.json();

        if (!response.ok) {
        throw new Error(
            data.error ??
            "Failed to update affiliations"
        );
        }

        setMemberships(data);
        setEditing(false);
        setUpdates([]);
        setNewTeamId("");
        setNewStartDate("");

    } catch (error) {
        console.error(
        "Failed to save affiliations:",
        error
        );

        setError(
        error instanceof Error
            ? error.message
            : "Failed to save affiliations."
        );
    } finally {
        setSaving(false);
    }
    };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="athlete-affiliations">
        <h3>Affiliations</h3>

        <p>Loading affiliations...</p>
      </div>
    );
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="athlete-affiliations">
      <div className="affiliations-header">
        <h3>Affiliations</h3>

        {isCoach && !editing && (
          <button
            type="button"
            className="main-button"
            onClick={startEditing}
          >
            Update Affiliations
          </button>
        )}
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* ==================================================
          CURRENT AFFILIATIONS
          ================================================== */}

      <section className="current-affiliations">
        <h4>Current</h4>

        {currentMemberships.length === 0 ? (
          <p>No current team affiliations.</p>
        ) : (
          <div className="affiliation-list">
            {currentMemberships.map((membership) => (
              <div
                className="affiliation"
                key={membership.teamMembershipId}
              >
                <strong>
                  {membership.team?.name ??
                    "Unknown team"}
                </strong>

                {membership.team?.club && (
                  <span>
                    {membership.team.club.name}
                  </span>
                )}

                {membership.startDate && (
                  <span>
                    Started{" "}
                    {new Date(
                      membership.startDate
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================================================
          PAST AFFILIATIONS
          ================================================== */}

      {pastMemberships.length > 0 && (
        <details className="affiliation-history">
          <summary>
            Past affiliations (
            {pastMemberships.length}
            )
          </summary>

          <div className="affiliation-history-list">
            {pastMemberships.map((membership) => (
              <div
                className="affiliation-history-row"
                key={membership.teamMembershipId}
              >
                <div>
                  <strong>
                    {membership.team?.name ??
                      "Unknown team"}
                  </strong>

                  {membership.team?.club && (
                    <span>
                      {membership.team.club.name}
                    </span>
                  )}
                </div>

                <span>
                  {membership.startDate
                    ? new Date(
                        membership.startDate
                      ).toLocaleDateString()
                    : "Unknown"}

                  {" – "}

                  {membership.endDate
                    ? new Date(
                        membership.endDate
                      ).toLocaleDateString()
                    : "Current"}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* ==================================================
          EDIT MODE
          ================================================== */}

      {editing && isCoach && (
        <section className="affiliation-editor">
          <h4>Update Affiliations</h4>

          <p className="affiliation-editor-help">
            You can edit affiliations for clubs you are
            currently a member of.
          </p>

          {/* ==================================================
              EXISTING EDITABLE MEMBERSHIPS
              ================================================== */}

          {updates.length > 0 ? (
            <div className="membership-editor-list">
              {updates.map((membership, index) => {
                const team = availableTeams.find(
                  (team) =>
                    team.teamId === membership.teamId
                );

                return (
                  <div
                    className="membership-editor"
                    key={
                      membership.teamMembershipId ??
                      `new-${membership.teamId}`
                    }
                  >
                    <div className="membership-editor-name">
                      <strong>
                        {team?.name ?? "Team"}
                      </strong>

                      {team?.club && (
                        <span>
                          {team.club.name}
                        </span>
                      )}
                    </div>

                    <label>
                      Start date

                      <input
                        type="date"
                        value={
                          membership.startDate
                        }
                        onChange={(event) =>
                          updateMembershipDate(
                            index,
                            "startDate",
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      End date

                      <input
                        type="date"
                        value={
                          membership.endDate
                        }
                        onChange={(event) =>
                          updateMembershipDate(
                            index,
                            "endDate",
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>
              You do not have any current affiliations
              that you can edit.
            </p>
          )}

          {/* ==================================================
              ADD TEAM
              ================================================== */}

          <div className="add-affiliation">
            <h5>Add Team</h5>

            <div className="add-affiliation-fields">
              <label>
                Team

                <select
                  value={newTeamId}
                  onChange={(event) =>
                    setNewTeamId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select a team
                  </option>

                  {availableTeams
                    .filter(
                      (team) =>
                        !memberships.some(
                          (membership) =>
                            membership.teamId ===
                              team.teamId &&
                            !membership.endDate
                        )
                    )
                    .map((team) => (
                      <option
                        key={team.teamId}
                        value={team.teamId}
                      >
                        {team.club?.name
                          ? `${team.club.name} — ${team.name}`
                          : team.name}
                      </option>
                    ))}
                </select>
              </label>

              <label>
                Start date

                <input
                  type="date"
                  value={newStartDate}
                  onChange={(event) =>
                    setNewStartDate(
                      event.target.value
                    )
                  }
                />
              </label>

              <button
                type="button"
                className="main-button"
                onClick={addTeam}
              >
                Add Team
              </button>
            </div>
          </div>

          {/* ==================================================
              EDITOR ACTIONS
              ================================================== */}

          <div className="affiliation-editor-actions">
            <button
              type="button"
              className="main-button"
              onClick={saveAffiliations}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={cancelEditing}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default AthleteAffiliations;