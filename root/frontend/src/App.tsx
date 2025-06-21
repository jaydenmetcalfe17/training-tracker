import { Route, BrowserRouter, Routes} from 'react-router-dom'
import './assets/css/App.css'
import MainLayout from './layout/MainLayout'
import CreateAthletePage from './pages/CreateAthletePage';
import CreateSessionPage from './pages/CreateSessionPage';
import CreateUserPage from './pages/CreateUserPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './layout/Dashboard';
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
	  <Route path="/dashboard" element={<Dashboard/>}/>
      {<Route path="*" element={<NotFoundPage/>}/>}
		</Routes>
	</BrowserRouter>
);

export default App