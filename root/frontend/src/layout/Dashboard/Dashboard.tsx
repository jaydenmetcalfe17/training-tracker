import type { FC } from 'react';
import "./Dashboard.scss";
import CoachDashboard from "../../pages/CoachDashboard/CoachDashboard";
// import ParentDashboard from "../../pages/ParentDashboard";
import AthleteDashboard from "../../pages/AthleteDashboard";
import DashboardErrorPage from "../../pages/DashboardErrorPage";

import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';


const Dashboard: React.FC = () => {


  // status dictates which dashboard appears 
  const { user, logout } = useContext(AuthContext);
  console.log("user first name: ", user?.userFirstName);

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
    <div className="dashboard">
      <DashboardComponent/>
    </div>
  )
}

export default Dashboard