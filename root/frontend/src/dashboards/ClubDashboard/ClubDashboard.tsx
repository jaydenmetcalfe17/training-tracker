// dashboards/ClubDashboard/ClubDashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Team } from "../../types/Team";
import GenerateInviteButton from "../../components/GenerateInviteButton/GenerateInviteButton";
import "./ClubDashboard.scss";

interface Club {
  clubId: number;
  name: string;
}

const ClubDashboard: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
      return;
    }

    const parsedClubId = Number(clubId);

    if (!Number.isInteger(parsedClubId)) {
      console.error("Invalid club ID:", clubId);
      setLoading(false);
      return;
    }

    const fetchClub = async () => {
      try {
        // ----------------------------------------
        // Get all clubs
        // ----------------------------------------

        const clubsResponse = await fetch("/api/clubs");

        if (!clubsResponse.ok) {
          throw new Error("Failed to load clubs");
        }

        const clubs: Club[] = await clubsResponse.json();

        const selectedClub = clubs.find(
          (club) => club.clubId === parsedClubId
        );

        if (!selectedClub) {
          throw new Error("Club not found");
        }

        setClub(selectedClub);

        // ----------------------------------------
        // Get teams belonging to this club
        // ----------------------------------------

        const teamsResponse = await fetch(
          `/api/teams?clubId=${parsedClubId}`
        );

        if (!teamsResponse.ok) {
          throw new Error("Failed to load teams");
        }

        const data = await teamsResponse.json();

        const clubTeams: Team[] = data.map((team: any) => ({
          teamId: team.team_id,
          clubId: team.club_id,
          name: team.name,
          club: team.club,
        }));

        setTeams(clubTeams);

        console.log("Selected club:", selectedClub);
        console.log("Club teams:", clubTeams);

      } catch (error) {
        console.error("Failed to load club:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [clubId]);

  if (loading) {
    return <div>Loading club...</div>;
  }

  if (!club) {
    return <div>Club not found.</div>;
  }

  return (
    <div className="light-blue-box">
      <div className="light-tan-box">
        <div className="club-dashboard">

          {/* Club name */}
          <h2>{club.name}</h2>

          {/* Invite coach */}
          <div className="generate-invite-butt" id="coach-invite">
            <div className="generate-invite-box">
              <h3>Invite a Coach</h3>
              <GenerateInviteButton role="coach" />
            </div>
          </div>

          {/* Teams */}
          <h3>Teams</h3>

          {teams.length === 0 ? (
            <p>This club does not have any teams.</p>
          ) : (
            <div className="team-list">
              {teams.map((team) => (
                <button
                  key={team.teamId}
                  className="main-button"
                  onClick={() => navigate(`/team/${team.teamId}`)}
                >
                  {team.name}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClubDashboard;