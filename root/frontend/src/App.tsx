import { Route, BrowserRouter, Routes} from 'react-router-dom'
import './assets/css/App.css'
import MainLayout from './layout/MainLayout'
import CreateAthletePage from './pages/CreateAthletePage';
import CreateSessionPage from './pages/CreateSessionPage';
import CreateUserPage from './pages/CreateUserPage';
import LoginPage from './pages/LoginPage';
import CoachDashboard from './pages/CoachDashboard';
import AthleteDashboard from './pages/AthleteDashboard';
import ParentDashboard from './pages/ParentDashboard';
import NotFoundPage from './pages/NotFoundPage';


const App: React.FC = () => (


	<BrowserRouter>
		<Routes>
      <Route path="/" element = {<MainLayout/>}/>
			{/* <Route index element={<HomePage/>}/> */}
      <Route path="/createAthlete" element={<CreateAthletePage/>}/>
	  <Route path="/createSession" element={<CreateSessionPage/>}/>
	  <Route path="/createUser" element={<CreateUserPage/>}/>
	  <Route path="/login" element={<LoginPage/>}/>
	  <Route path="/coachDashboard" element={<CoachDashboard/>}/>
	  <Route path="/athleteDashboard" element={<AthleteDashboard/>}/>
	  <Route path="/parentDashboard" element={<ParentDashboard/>}/>
      {<Route path="*" element={<NotFoundPage/>}/>}
		</Routes>
	</BrowserRouter>
);

export default App