// pages/CoachDashboard.tsx

import "./CoachDashboard.scss";
import CreateAthletePage from "../CreateAthletePage/CreateAthletePage"
import CreateSessionPage from "../CreateSessionPage/CreateSessionPage"
import GenerateInviteButton from "../../components/GenerateInviteButton/GenerateInviteButton";

const CoachDashboard: React.FC = () => {
  return (
    <div className="light-blue-box">
      <div className="light-tan-box">
        <div className="coach-dashboard">
          <div className="generate-invite-butt" id="coach-invite">
            <div className="generate-invite-box">
              <h3>Invite a Coach</h3>
              <GenerateInviteButton role="coach" />
            </div>
          </div>
          <div className="athlete-session-box">
            <CreateAthletePage />
            <CreateSessionPage />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoachDashboard
