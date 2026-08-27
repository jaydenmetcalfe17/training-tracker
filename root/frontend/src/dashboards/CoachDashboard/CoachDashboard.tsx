// dashboards/CoachDashboard/CoachDashboard.tsx

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import type { Club } from "../../types/Club";
import "./CoachDashboard.scss";

interface CoachTeam {
  team_id: number;
  club_id: number;
  name: string;
}

const CoachDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) {
      console.log("No user ID available");
      setLoading(false);
      return;
    }

    const fetchCoachClubs = async () => {
      try {
        // Get the teams this coach belongs to
        const teamsResponse = await fetch(
          `/api/teams?coachId=${user.userId}`
        );

        if (!teamsResponse.ok) {
          throw new Error("Failed to load coach teams");
        }

        const teams: CoachTeam[] = await teamsResponse.json();

        console.log("Coach teams:", teams);

        // Get all clubs
        const clubsResponse = await fetch("/api/clubs");

        if (!clubsResponse.ok) {
          throw new Error("Failed to load clubs");
        }

        const allClubs: Club[] = await clubsResponse.json();

        console.log("All clubs:", allClubs);

        // Get unique club IDs from the coach's teams
        const coachClubIds = [
          ...new Set(
            teams
              .map((team) => team.club_id)
              .filter(
                (clubId): clubId is number =>
                  clubId !== undefined && clubId !== null
              )
          ),
        ];

        console.log("Coach club IDs:", coachClubIds);

        // Match those IDs to the actual clubs
        const coachClubs = allClubs.filter((club) =>
          coachClubIds.includes(club.clubId)
        );

        console.log("Coach clubs:", coachClubs);

        setClubs(coachClubs);
      } catch (error) {
        console.error("Failed to load coach clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachClubs();
  }, [user]);

  if (loading) {
    return <div>Loading clubs...</div>;
  }

  return (
    <div className="light-blue-box">
      <div className="light-tan-box">
        <div className="coach-dashboard">

          <h2>My Clubs</h2>

          {clubs.length === 0 ? (
            <p>You are not currently associated with any clubs.</p>
          ) : (
            <div className="club-list">
              {clubs.map((club) => (
                <button
                  key={club.clubId}
                  className="main-button"
                  onClick={() => navigate(`/club/${club.clubId}`)}
                >
                  {club.name}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;