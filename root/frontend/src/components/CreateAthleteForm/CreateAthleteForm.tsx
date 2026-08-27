// components/CreateAthleteForm/CreateAthleteForm.tsx

import {
  useEffect,
  useState,
} from "react";

import type { CreateAthleteRequest } from "../../types/CreateAthleteRequest";
import type { Club } from "../../types/Club";
import type { Team } from "../../types/Team";

import "./CreateAthleteForm.scss";


interface AthleteFormProps {

  onSubmit:
    (
      athlete: CreateAthleteRequest
    ) => void | Promise<void>;

  teamId?: number;

  clubId?: number;
}


interface SearchResult {

  athlete_id: number;

  athlete_first_name: string;

  athlete_last_name: string;

  birthday?: string | null;

  gender: string;

  aca_id?: number | null;

  fis_id?: number | null;

  age_group?: string | null;

  team_memberships?: any[];
}


const CreateAthleteForm:
  React.FC<AthleteFormProps> = ({
    onSubmit,
    teamId,
    clubId,
  }) => {

  const [formData, setFormData] =
    useState({

      athleteFirstName: "",
      athleteLastName: "",
      birthday: "",
      gender: "",
      acaId: "",
      fisId: "",
      ageGroup: "",

      clubId:
        clubId
          ? String(clubId)
          : "",

      teamId:
        teamId
          ? String(teamId)
          : "",
    });


  const [clubs, setClubs] =
    useState<Club[]>([]);

  const [teams, setTeams] =
    useState<Team[]>([]);

  const [errors, setErrors] =
    useState<{
      [key: string]: string
    }>({});


  // ----------------------------------------
  // Search state
  // ----------------------------------------

  const [searchId, setSearchId] =
    useState("");

  const [searchType, setSearchType] =
    useState<
      "aca" | "fis"
    >("aca");

  const [searching, setSearching] =
    useState(false);

  const [searchResult, setSearchResult] =
    useState<SearchResult | null>(
      null
    );

  const [searchError, setSearchError] =
    useState("");

  const [addingExisting, setAddingExisting] =
    useState(false);


  // ----------------------------------------
  // Load clubs
  // ----------------------------------------

  useEffect(() => {

    fetch("/api/clubs")

      .then((res) => {

        if (!res.ok) {
          throw new Error(
            "Failed to load clubs"
          );
        }

        return res.json();
      })

      .then((data) => {

        const loadedClubs:
          Club[] =
          data.map(
            (club: any) => ({
              clubId:
                club.clubId,

              name:
                club.name,

              teams:
                club.teams ?? [],
            })
          );

        setClubs(
          loadedClubs
        );
      })

      .catch((err) => {

        console.error(
          "Unable to load clubs:",
          err
        );
      });

  }, []);


  // ----------------------------------------
  // Set team / club from page
  // ----------------------------------------

  useEffect(() => {

    setFormData(
      (prev) => ({
        ...prev,

        clubId:
          clubId
            ? String(clubId)
            : prev.clubId,

        teamId:
          teamId
            ? String(teamId)
            : prev.teamId,
      })
    );

  }, [
    clubId,
    teamId,
  ]);


  // ----------------------------------------
  // Load teams whenever club changes
  // ----------------------------------------

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

        const loadedTeams:
          Team[] =
          data.map(
            (team: any) => ({
              teamId:
                team.team_id,

              clubId:
                team.club_id,

              name:
                team.name,
            })
          );

        setTeams(
          loadedTeams
        );
      })

      .catch((err) => {

        console.error(
          "Unable to load teams:",
          err
        );

        setTeams([]);
      });

  }, [
    formData.clubId
  ]);


  // ----------------------------------------
  // Search existing athlete
  // ----------------------------------------

  const searchAthlete = async () => {

    if (!searchId.trim()) {

      setSearchError(
        "Enter an ACA ID or FIS ID."
      );

      setSearchResult(
        null
      );

      return;
    }


    if (!/^\d+$/.test(searchId.trim())) {

      setSearchError(
        "ID must contain numbers only."
      );

      setSearchResult(
        null
      );

      return;
    }


    setSearching(true);

    setSearchError("");

    setSearchResult(null);


    try {

      const queryParam =
        searchType === "aca"
          ? `acaId=${searchId.trim()}`
          : `fisId=${searchId.trim()}`;


      const response =
        await fetch(
          `/api/athlete?${queryParam}`,
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        if (
          response.status === 404
        ) {

          setSearchError(
            "No athlete was found with that ID."
          );

          return;
        }

        throw new Error(
          data.error ||
          "Failed to search for athlete"
        );
      }


      const athlete =
        Array.isArray(data)
          ? data[0]
          : data;


      if (!athlete) {

        setSearchError(
          "No athlete was found with that ID."
        );

        return;
      }


      setSearchResult(
        athlete
      );

    } catch (error) {

      console.error(
        "Athlete search failed:",
        error
      );

      setSearchError(
        "Unable to search for athlete."
      );

    } finally {

      setSearching(false);
    }
  };


  // ----------------------------------------
  // Add existing athlete to current team
  // ----------------------------------------

  const addExistingAthlete =
    async () => {

      if (
        !searchResult ||
        !teamId
      ) {
        return;
      }


      setAddingExisting(true);

      setSearchError("");


      try {

        await onSubmit({

          athleteFirstName:
            searchResult
              .athlete_first_name,

          athleteLastName:
            searchResult
              .athlete_last_name,

          birthday:
            searchResult.birthday
              ? new Date(
                  searchResult.birthday
                )
                  .toISOString()
                  .split("T")[0]
              : "",

          gender:
            searchResult.gender,

          acaId:
            searchResult.aca_id
              ?? undefined,

          fisId:
            searchResult.fis_id
              ?? undefined,

          ageGroup:
            searchResult.age_group
              ?? undefined,

          clubId:
            clubId,

          teamId:
            teamId,

          // Important:
          // The backend will recognise the
          // existing ACA/FIS ID and attach
          // this athlete instead of creating
          // another athlete.
        });


        setSearchResult(null);

        setSearchId("");

      } catch (error) {

        console.error(
          "Failed to add existing athlete:",
          error
        );

        setSearchError(
          error instanceof Error
            ? error.message
            : "Failed to add athlete."
        );

      } finally {

        setAddingExisting(false);
      }
    };


  // ----------------------------------------
  // Normal form changes
  // ----------------------------------------

  const handleChange = (
    e:
      React.ChangeEvent<
        HTMLInputElement |
        HTMLSelectElement
      >
  ) => {

    const {
      name,
      value,
    } = e.target;


    let errorMessage = "";


    if (
      name === "gender"
    ) {

      const allowedGenders =
        [
          "Male",
          "Female",
        ];


      if (
        value &&
        !allowedGenders.includes(
          value
        )
      ) {

        errorMessage =
          "Please enter Male or Female.";
      }
    }


    if (
      name === "ageGroup"
    ) {

      const allowedAgeGroups =
        [
          "U10",
          "U12",
          "U14",
          "U16",
          "FIS",
        ];


      if (
        value &&
        !allowedAgeGroups.includes(
          value
        )
      ) {

        errorMessage =
          "Please enter a valid age group.";
      }
    }


    setErrors(
      (prev) => ({
        ...prev,

        [name]:
          errorMessage,
      })
    );


    setFormData(
      (prev) => ({
        ...prev,

        [name]:
          value,

        ...(name === "clubId"
          ? {
              teamId:
                "",
            }
          : {}),
      })
    );
  };


  // ----------------------------------------
  // Submit new athlete
  // ----------------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    // ----------------------------------------
    // Clear previous submit error
    // ----------------------------------------

    setErrors((prev) => ({
      ...prev,
      submit: "",
    }));


    // ----------------------------------------
    // Make sure a team is selected
    // ----------------------------------------

    if (!formData.teamId) {

      setErrors((prev) => ({
        ...prev,

        teamId:
          "Please select a team.",
      }));

      return;
    }


    // ----------------------------------------
    // Build athlete request
    // ----------------------------------------

    const newAthlete:
      CreateAthleteRequest = {

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
          ? Number(
              formData.acaId
            )
          : undefined,

      fisId:
        formData.fisId
          ? Number(
              formData.fisId
            )
          : undefined,

      ageGroup:
        formData.ageGroup
          || undefined,

      clubId:
        formData.clubId
          ? Number(
              formData.clubId
            )
          : undefined,

      teamId:
        formData.teamId
          ? Number(
              formData.teamId
            )
          : undefined,
    };


    // ----------------------------------------
    // Submit
    // ----------------------------------------

    try {

      await onSubmit(
        newAthlete
      );


      // --------------------------------------
      // Reset fields ONLY if successful
      // --------------------------------------

      setFormData(
        (prev) => ({
          ...prev,

          athleteFirstName:
            "",

          athleteLastName:
            "",

          birthday:
            "",

          gender:
            "",

          acaId:
            "",

          fisId:
            "",

          ageGroup:
            "",

          teamId:
            teamId
              ? String(teamId)
              : "",
        })
      );


      setErrors({});


    } catch (error) {

      console.error(
        "Failed to create athlete:",
        error
      );


      // --------------------------------------
      // Display backend error
      // --------------------------------------

      setErrors((prev) => ({
        ...prev,

        submit:
          error instanceof Error
            ? error.message
            : "Failed to add athlete.",
      }));
    }
  };


  return (

    <div className="create-athlete-box">

      <div className="light-tan-box">

        <h2 className="box-h2-title">
          Add Athlete
        </h2>


        <div className="white-box" id="create-white-box">

          {/* ====================================== */}
          {/* SEARCH EXISTING ATHLETE                */}
          {/* ====================================== */}

          <div className="athlete-search-section">

            <h3>
              Search Existing Athlete
            </h3>


            <div className="athlete-search-controls">

              <select
                value={searchType}
                onChange={(e) =>
                  setSearchType(
                    e.target.value as
                      "aca" |
                      "fis"
                  )
                }
              >

                <option value="aca">
                  ACA ID
                </option>

                <option value="fis">
                  FIS ID
                </option>

              </select>


              <input
                type="text"
                inputMode="numeric"
                value={searchId}
                onChange={(e) =>
                  setSearchId(
                    e.target.value
                  )
                }
                placeholder={
                  searchType === "aca"
                    ? "Enter ACA ID"
                    : "Enter FIS ID"
                }
              />


              <button
                type="button"
                className="main-button"
                onClick={
                  searchAthlete
                }
                disabled={
                  searching
                }
              >
                {searching
                  ? "Searching..."
                  : "Search"}
              </button>

            </div>


            {searchError && (

              <p className="error-text">
                {searchError}
              </p>

            )}


            {/* ================================== */}
            {/* SEARCH RESULT                      */}
            {/* ================================== */}

            {searchResult && (

              <div className="athlete-search-result">

                <h4>
                  Athlete Found
                </h4>


                <p>
                  <strong>
                    {
                      searchResult
                        .athlete_first_name
                    }{" "}
                    {
                      searchResult
                        .athlete_last_name
                    }
                  </strong>
                </p>


                {searchResult.aca_id && (

                  <p>
                    ACA ID:{" "}
                    {
                      searchResult
                        .aca_id
                    }
                  </p>

                )}


                {searchResult.fis_id && (

                  <p>
                    FIS ID:{" "}
                    {
                      searchResult
                        .fis_id
                    }
                  </p>

                )}


                <button
                  type="button"
                  className="main-button"
                  onClick={
                    addExistingAthlete
                  }
                  disabled={
                    addingExisting
                  }
                >
                  {addingExisting
                    ? "Adding..."
                    : "Add Athlete to Team"}
                </button>

              </div>

            )}

          </div>


          {/* ====================================== */}
          {/* DIVIDER                                */}
          {/* ====================================== */}

          <div className="athlete-form-divider">
            <span>
              <b>OR</b>
            </span>
          </div>


          {/* ====================================== */}
          {/* CREATE NEW ATHLETE                     */}
          {/* ====================================== */}

          <div className="athlete-create-section">

            <h3>
              Create New Athlete
            </h3>


            <form
              className="create-athlete-form"
              onSubmit={
                handleSubmit
              }
            >

              <div className="one-column-form">

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
                      formData
                        .athleteFirstName
                    }
                    onChange={
                      handleChange
                    }
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
                      formData
                        .athleteLastName
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {/* Birthday */}

                <div className="form-group">

                  <label>
                    Birthday:
                  </label>

                  <input
                    required
                    name="birthday"
                    type="date"
                    value={
                      formData
                        .birthday
                    }
                    onChange={
                      handleChange
                    }
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
                      formData
                        .gender
                    }
                    onChange={
                      handleChange
                    }
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
                      {
                        errors.gender
                      }
                    </p>

                  )}

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
                      formData
                        .acaId
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Optional"
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
                      formData
                        .fisId
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Optional"
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
                      formData
                        .clubId
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !!clubId
                    }
                  >

                    <option value="">
                      Select club
                    </option>

                    {clubs.map(
                      (club) => (

                        <option
                          key={
                            `club-${club.clubId}`
                          }
                          value={
                            String(
                              club.clubId
                            )
                          }
                        >
                          {
                            club.name
                          }
                        </option>

                      )
                    )}

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
                      formData
                        .teamId
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !formData.clubId ||
                      !!teamId
                    }
                  >

                    <option value="">

                      {formData.clubId
                        ? "Select team"
                        : "Select a club first"}

                    </option>


                    {teams.map(
                      (team) => (

                        <option
                          key={
                            `team-${team.teamId}`
                          }
                          value={
                            team.teamId
                          }
                        >
                          {
                            team.name
                          }
                        </option>

                      )
                    )}

                  </select>


                  {errors.teamId && (

                    <p className="error-text">
                      {
                        errors.teamId
                      }
                    </p>

                  )}

                </div>


                {/* Submit */}

                <button
                  type="submit"
                  className="main-button"
                  id="create-athlete-profile-button"
                >
                  Create Athlete Profile
                </button>

                {errors.submit && (
                  <p
                    className="error-text"
                    data-testid="create-athlete-error"
                  >
                    {errors.submit}
                  </p>
                )}

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};


export default CreateAthleteForm;