//frontend/src/components/SessionFilter/SessionFilter.tsx

import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Session } from "../../types/Session";
import type { Athlete } from "../../types/Athlete";

import SessionsList from "../SessionsList/SessionsList";
import PieChart from "../PieChart/PieChart";

import "./SessionFilter.scss";

import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

import EditAthleteForm from "../EditAthleteForm/EditAthleteForm";
import GenerateInviteButton from "../GenerateInviteButton/GenerateInviteButton";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface FilterSessionsProps {
  athlete?: Athlete | null;
}

const SessionFilter: React.FC<FilterSessionsProps> = ({
  athlete,
}) => {
  const [filteredSessions, setFilteredSessions] =
    useState<Session[]>([]);

  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  const startDateRef =
    useRef<HTMLInputElement | null>(null);

  const endDateRef =
    useRef<HTMLInputElement | null>(null);

  const locationRef =
    useRef<HTMLInputElement | null>(null);

  const disciplineRef =
    useRef<HTMLInputElement | null>(null);

  const snowConditionsRef =
    useRef<HTMLInputElement | null>(null);

  const visConditionsRef =
    useRef<HTMLInputElement | null>(null);

  const terrainTypeRef =
    useRef<HTMLInputElement | null>(null);

  const isCoach = user?.status === "coach";

  useEffect(() => {
    fetchSessions();
  }, [athlete, user]);

  const fetchSessions = () => {
    const params = new URLSearchParams();

    if (athlete?.athleteId) {
      params.append(
        "athleteId",
        athlete.athleteId.toString()
      );
    }

    if (startDateRef.current?.value) {
      params.append(
        "startDate",
        startDateRef.current.value
      );
    }

    if (endDateRef.current?.value) {
      params.append(
        "endDate",
        endDateRef.current.value
      );
    }

    if (locationRef.current?.value) {
      params.append(
        "location",
        locationRef.current.value
      );
    }

    if (disciplineRef.current?.value) {
      params.append(
        "discipline",
        disciplineRef.current.value
      );
    }

    if (snowConditionsRef.current?.value) {
      params.append(
        "snowConditions",
        snowConditionsRef.current.value
      );
    }

    if (visConditionsRef.current?.value) {
      params.append(
        "visConditions",
        visConditionsRef.current.value
      );
    }

    if (terrainTypeRef.current?.value) {
      params.append(
        "terrainType",
        terrainTypeRef.current.value
      );
    }

    fetch(`/api/session?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Failed to load sessions"
          );
        }

        return res.json();
      })
      .then((data) => {
        const mappedSessions: Session[] =
          data.map((session: any) => ({
            sessionId:
              session.session_id,

            sessionDay:
              session.session_day
                ? new Date(
                    session.session_day
                  )
                    .toISOString()
                    .split("T")[0]
                : "",

            startTime:
              session.start_time
                ? session.start_time.slice(0, 5)
                : "",

            endTime:
              session.end_time
                ? session.end_time.slice(0, 5)
                : "",

            location:
              session.location,

            discipline:
              session.discipline,

            snowConditions:
              session.snow_conditions,

            visConditions:
              session.vis_conditions,

            terrainType:
              session.terrain_type,

            numFreeskiRuns:
              session.num_freeski_runs,

            numDrillRuns:
              session.num_drill_runs,

            numEducationalCourseRuns:
              session.num_educational_course_runs,

            numGatesEducationalCourse:
              session.num_gates_educational_course,

            numRaceTrainingCourseRuns:
              session.num_race_training_course_runs,

            numGatesRaceTrainingCourse:
              session.num_gates_race_training_course,

            numRaceRuns:
              session.num_race_runs,

            numGatesRace:
              session.num_gates_race,

            generalComments:
              session.general_comments,
          }));

        setFilteredSessions(mappedSessions);
      })
      .catch((err) =>
        console.error(
          "Unable to load sessions:",
          err
        )
      );
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    fetchSessions();
  };

  // ----------------------------------------
  // Athlete affiliations
  // ----------------------------------------

  const activeMemberships =
    athlete?.teamMemberships?.filter(
      (membership) =>
        membership.endDate == null
    ) ?? [];

  const affiliations: {
    club: any;
    teams: any[];
  }[] = [];

  activeMemberships.forEach(
    (membership) => {
      const team = membership.team;
      const club = team?.club;

      if (!team || !club) {
        return;
      }

      const existingAffiliation =
        affiliations.find(
          (affiliation) =>
            affiliation.club.clubId ===
            club.clubId
        );

      if (existingAffiliation) {
        const alreadyAdded =
          existingAffiliation.teams.some(
            (existingTeam) =>
              existingTeam.teamId ===
              team.teamId
          );

        if (!alreadyAdded) {
          existingAffiliation.teams.push(
            team
          );
        }
      } else {
        affiliations.push({
          club,
          teams: [team],
        });
      }
    }
  );

  // Edit/update athlete
  const [showEditPopup, setShowEditPopup] =
    useState(false);

  const toggleEditPopup = () => {
    setShowEditPopup(
      (prev) => !prev
    );
  };

  const editAthleteProfile = (
    updatedAthlete: Athlete
  ) => {
    console.log(
      "updated: ",
      updatedAthlete
    );

    if (!updatedAthlete || !athlete) {
      return;
    }

    fetch(
      `/api/athlete/${athlete.athleteId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          updatedAthlete
        ),
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Failed to update athlete profile"
          );
        }

        return res.json();
      })
      .then((data) => {
        console.log(
          "Athlete updated:",
          data
        );

        toggleEditPopup();
      })
      .catch((err) =>
        console.error(
          "Failed to update athlete profile:",
          err
        )
      );
  };

  // Delete athlete
  const [showDeletePopup, setShowDeletePopup] =
    useState(false);

  const toggleDeletePopup = () => {
    setShowDeletePopup(
      (prev) => !prev
    );
  };

  const deleteAthlete = () => {
    if (!athlete) {
      return;
    }

    fetch(
      `/api/athlete/${athlete.athleteId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Failed to delete athlete"
          );
        }

        return res.json();
      })
      .then((data) => {
        console.log(
          "Athlete deleted:",
          data
        );

        navigate("/dashboard");
      })
      .catch((err) =>
        console.error(
          "Failed to delete athlete:",
          err
        )
      );
  };

  if (!athlete) {
    return null;
  }

  return (
    <>
    <div className="pie-filter-box">
      <div className="details-filters-box">
        <div className = "pie-info-box">
          <div className="info-buttons-box">
            <div className="athlete-info-box">
                {athlete != null ? (
                  <>
                    <h2 className="athlete-name">
                      {athlete.athleteFirstName.toUpperCase()}{" "}
                      {athlete.athleteLastName.toUpperCase()}
                    </h2>
                  
                  <div className="athlete-details-box">
                      <h3>Birthday:{" "}
                      {athlete.birthday
                        ? athlete.birthday.split("T")[0]
                        : ""}
                      </h3>

                      <div className="athlete-affiliations">
                        <h3>Affiliations:</h3>

                        {affiliations.length === 0 ? (
                          <p>No active affiliations</p>
                        ) : (
                          affiliations.map(
                            (affiliation) => (
                              <div
                                className="affiliation"
                                key={
                                  affiliation.club.clubId
                                }
                              >
                                <h4>
                                  {affiliation.club.name}
                                </h4>

                                <ul>
                                  {affiliation.teams.map(
                                    (team) => (
                                      <li
                                        key={team.teamId}
                                      >
                                        {team.name}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )
                          )
                        )}
                      </div>

                      <h3>ACA ID: {athlete.acaId ?? "N/A"}</h3>

                      <h3>FIS ID: {athlete.fisId ?? "N/A"}</h3>
                  </div>
                  </>
              ) : (
                <h2 className="athlete-name">SESSIONS</h2>
              )}
            </div>
            <div className="delete-edit-button-box">
              <div className="duo-box">
                {isCoach && (
                    <button
                      className="main-button"
                      id="edit-button"
                      onClick={toggleEditPopup}
                    >
                      <EditIcon />
                    </button>
                  )}

                  {showEditPopup && (
                    <div className="popup-overlay">
                      <div className="popup-content" data-testid="edit-popup">
                        <EditAthleteForm
                          athlete={athlete}
                          onSubmit={editAthleteProfile}
                        />
                      </div>
                    </div>
                  )}
              </div>
              
              <div className="duo-box">
                {isCoach && (
                  <button
                    className="main-button"
                    id="delete-button"
                    onClick={toggleDeletePopup}
                  >
                    <DeleteIcon />
                  </button>
                )}

                {showDeletePopup && (
                  <>
                    Are you sure you want to delete this athlete?

                    <button
                      className="main-button"
                      onClick={deleteAthlete}
                    >
                      Yes, delete the athlete
                    </button>

                    <button
                      className="main-button"
                      onClick={toggleDeletePopup}
                    >
                      No, keep the athlete
                    </button>
                  </>
                )}
              </div>
            </div>
            
          
            {isCoach && (
              <div className="buttons-box">
                <div className="generate-invite-butt">
                    <div className="generate-invite-box">
                      <h3>Invite an Athlete:</h3>

                      <GenerateInviteButton
                        athleteId={athlete.athleteId}
                        role="athlete"
                      />
                    </div>
                    
                    <div className="generate-invite-box">
                      <h3>Invite a Parent:</h3>

                      <GenerateInviteButton
                        athleteId={athlete.athleteId}
                        role="parent"
                      />
                    </div>
                </div>
              </div>
            )}

          </div>

          <div className="pie-chart">
            <PieChart
              selection={"sessions"}
              athleteId={athlete?.athleteId}
            />
          </div>

        </div>

        <div className="search-sessions-list-box">

          <form className= "filters-form" onSubmit={handleSubmit}>
            <div className="filters-form-labels">
              <div className="filters-lab-in">
                <label>Start Date: </label>
                <input
                  type="date"
                  ref={startDateRef}
                />
              </div>

              <div className="filters-lab-in">
                <label>End Date: </label>
                <input
                  type="date"
                  ref={endDateRef}
                />
              </div>

              <div className="filters-lab-in">
                <label>Location: </label>
                <input
                  type="text"
                  ref={locationRef}
                />
              </div>

              <div className="filters-lab-in">
                <label>Discipline: </label>
                <input
                  type="text"
                  ref={disciplineRef}
                />
              </div>

              <div className="filters-lab-in">
                <label>Snow Conditions: </label>
                <input
                  type="text"
                  ref={snowConditionsRef}
                />
              </div>

              <div className="filters-lab-in">
                <label>Visibility Conditions: </label>
                <input
                  type="text"
                  ref={visConditionsRef}
                />
              </div>

              <div className="filters-lab-in">
                <label>Terrain Type: </label>
                <input
                  type="text"
                  ref={terrainTypeRef}
                />
              </div>
            </div>
            <button
              className="main-button"
              id="apply-filters-button"
              type="submit"
            >
              Apply Filters
            </button>
          </form>
        </div>
       </div>
    </div>
      <SessionsList
        sessions={filteredSessions}
      />
    </>
  );
};

export default SessionFilter;
