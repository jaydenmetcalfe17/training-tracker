import "./CoachDashboard.scss";
import CreateAthletePage from "../CreateAthletePage/CreateAthletePage"
import CreateSessionPage from "../CreateSessionPage/CreateSessionPage"
import GenerateInviteButton from "../../components/GenerateInviteButton";

const CoachDashboard: React.FC = () => {
  return (
    <div className="coach-dashboard">
      <div className="generate-invite-button">
        <h3>Invite a Coach</h3>
        <GenerateInviteButton role="coach" />
      </div>
      <div className="athlete-session-box">
        <CreateAthletePage />
        <CreateSessionPage />
      </div>
    </div>
  )
}

export default CoachDashboard
