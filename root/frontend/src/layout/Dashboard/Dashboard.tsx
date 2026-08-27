// layout/Dashboard.tsx

import type { FC } from 'react';
import "./Dashboard.scss";
// import ParentDashboard from "../../pages/ParentDashboard";
import AthleteDashboard from "../../dashboards/AthleteDashboard/AthleteDashboard";
import DashboardErrorPage from "../../dashboards/DashboardErrorPage/DashboardErrorPage";

import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import CoachDashboard from '../../dashboards/CoachDashboard/CoachDashboard';


const Dashboard: React.FC = () => {


  // status dictates which dashboard appears 
  // const { user, logout } = useContext(AuthContext);
  const { user } = useContext(AuthContext);
  console.log("user first name: ", user?.userFirstName, "user status: ", user?.status, "user id: ", user?.userId, "athlete id: ", user?.athleteId);

  let status = user?.status || '';
  let DashboardComponent: FC = DashboardErrorPage;

  switch(status) {
    case 'coach':
      DashboardComponent = CoachDashboard;
      break;

    case 'athlete':
      DashboardComponent = AthleteDashboard;
      break;

    // ParentDashboard blank component exists if wanting to change in future/if there becomes a difference between the two 
    case 'parent':
      DashboardComponent = AthleteDashboard; 
      break;
    
    default: 
      DashboardComponent = DashboardErrorPage;
  }


  return (
    <div >
      <DashboardComponent/>
    </div>
  )
}

export default Dashboard