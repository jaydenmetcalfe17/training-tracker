import { Navigate, Route, Routes} from 'react-router-dom'
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
import AuthContext from './context/AuthContext';
import { useContext } from 'react';
import ProtectedRoute from './components/ProtectedRoute';


const App: React.FC = () => {

	const { isLoggedIn } = useContext(AuthContext);

	return (

		<Routes>
			<Route path="/" element={
				isLoggedIn() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
			}/>

			<Route path="/" element = {<MainLayout/>}>
				<Route path="/createAthlete" element={<ProtectedRoute allowedRoles={["coach"]}><CreateAthletePage/></ProtectedRoute>}/>
				<Route path="/createSession" element={<ProtectedRoute allowedRoles={["coach"]}><CreateSessionPage/></ProtectedRoute>}/>
				<Route path="/register/:inviteToken" element={<CreateUserPage />} />
				<Route path="/login" element={<LoginPage/>}/>
				<Route index path="/dashboard" element={<ProtectedRoute allowedRoles={["coach", "athlete", "parent"]}><Dashboard/></ProtectedRoute>}/>
				<Route path="/athlete/:athleteId" element={<ProtectedRoute allowedRoles={["coach"]}><AthleteDashboard/></ProtectedRoute>}/>
				<Route path="/session/:sessionId" element={<ProtectedRoute allowedRoles={["coach"]}><SessionPage/></ProtectedRoute>}/>
				{<Route path="*" element={<NotFoundPage/>}/>}
			</Route>
		</Routes>
 );
}

export default App