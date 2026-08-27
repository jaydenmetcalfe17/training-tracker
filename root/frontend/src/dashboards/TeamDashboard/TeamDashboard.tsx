// dashboards/TeamDashboard/TeamDashboard.tsx

import "./TeamDashboard.scss";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreateAthletePage from "../../pages/CreateAthletePage/CreateAthletePage";
import CreateSessionPage from "../../pages/CreateSessionPage/CreateSessionPage";
import GenerateInviteButton from "../../components/GenerateInviteButton/GenerateInviteButton";

const TeamDashboard: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();

  const [clubId, setClubId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!teamId) {
      return;
    }

    fetch(`/api/teams?teamId=${teamId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load team");
        }

        return res.json();
      })
      .then((data) => {
        const team = Array.isArray(data) ? data[0] : data;

        if (team) {
          setClubId(team.club_id);
        }
      })
      .catch((err) => {
        console.error("Unable to load team:", err);
      });
  }, [teamId]);

  if (!teamId) {
    return <p>Invalid team.</p>;
  }

  return (
    <div className="light-blue-box">
      <div className="light-tan-box">
        <div className="team-dashboard">

          <div className="generate-invite-butt" id="coach-invite">
            <div className="generate-invite-box">
              <h3>Invite a Coach</h3>
              <GenerateInviteButton role="coach" teamId={Number(teamId)}/>
            </div>
          </div>

          <div className="athlete-session-box">
            <CreateAthletePage
              teamId={Number(teamId)}
              clubId={clubId}
            />

            <CreateSessionPage
              teamId={Number(teamId)}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;