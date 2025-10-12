import { Route, BrowserRouter, Routes} from 'react-router-dom'
import './assets/scss/App.scss'
import MainLayout from './layout/MainLayout'
import CreateAthletePage from './pages/CreateAthletePage';
import CreateSessionPage from './pages/CreateSessionPage';
import CreateUserPage from './pages/CreateUserPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './layout/Dashboard/Dashboard';
import NotFoundPage from './pages/NotFoundPage';
import AthleteDashboard from './pages/AthleteDashboard';


const App: React.FC = () => (

	// <BrowserRouter>
		<Routes>
			<Route path="/" element = {<MainLayout/>}>
				<Route path="/createAthlete" element={<CreateAthletePage/>}/>
				<Route path="/createSession" element={<CreateSessionPage/>}/>
				<Route path="/createUser" element={<CreateUserPage/>}/>
				<Route path="/login" element={<LoginPage/>}/>
				<Route index path="/dashboard" element={<Dashboard/>}/>
				<Route path="/athlete/:athleteId" element={<AthleteDashboard/>}/>
				{<Route path="*" element={<NotFoundPage/>}/>}
			</Route>
		</Routes>
	// </BrowserRouter>
);


export default App