import { Route, BrowserRouter, Routes} from 'react-router-dom'
import './assets/scss/App.scss'
import MainLayout from './layout/MainLayout/MainLayout'
import CreateAthletePage from './pages/CreateAthletePage/CreateAthletePage';
import CreateSessionPage from './pages/CreateSessionPage/CreateSessionPage';
import CreateUserPage from './pages/CreateUserPage/CreateUserPage';
import LoginPage from './pages/LoginPage/LoginPage';
import Dashboard from './layout/Dashboard/Dashboard';
import NotFoundPage from './pages/NotFoundPage';
import AthleteDashboard from './pages/AthleteDashboard/AthleteDashboard';
import SessionPage from './pages/SessionPage/SessionPage';


const App: React.FC = () => (

	// <BrowserRouter>
		<Routes>
			<Route path="/" element = {<MainLayout/>}>
				<Route path="/createAthlete" element={<CreateAthletePage/>}/>
				<Route path="/createSession" element={<CreateSessionPage/>}/>
				<Route path="/register/:inviteToken" element={<CreateUserPage />} />
				<Route path="/login" element={<LoginPage/>}/>
				<Route index path="/dashboard" element={<Dashboard/>}/>
				<Route path="/athlete/:athleteId" element={<AthleteDashboard/>}/>
				<Route path="/session/:sessionId" element={<SessionPage/>}/>
				{<Route path="*" element={<NotFoundPage/>}/>}
			</Route>
		</Routes>
	// </BrowserRouter>
);


export default App