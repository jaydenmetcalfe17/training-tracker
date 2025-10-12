import "./CoachDashboard.scss";
import CreateAthletePage from "../CreateAthletePage/CreateAthletePage"
import CreateSessionPage from "../CreateSessionPage/CreateSessionPage"

const CoachDashboard: React.FC = () => {
  return (
    <div className="coach-dashboard">
      <CreateAthletePage />
      <CreateSessionPage />
    </div>
  )
}

export default CoachDashboard
