import type { FC } from 'react';
import CoachDashboard from "../../pages/CoachDashboard";
import ParentDashboard from "../../pages/ParentDashboard";
import AthleteDashboard from "../../pages/AthleteDashboard";
import DashboardErrorPage from "../../pages/DashboardErrorPage";

import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import Header from "../../components/Header/Header";


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

    case 'parent':
      DashboardComponent = ParentDashboard;
      break;
    
    default: 
      DashboardComponent = DashboardErrorPage;
  }




  return (
    <>
      <DashboardComponent/>
    </>
  )
}

export default Dashboard