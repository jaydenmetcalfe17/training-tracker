import { Route, BrowserRouter, Routes} from 'react-router-dom'
import './assets/css/App.css'
import MainLayout from './layout/MainLayout'
import CreateAthletePage from './pages/CreateAthletePage';


const App: React.FC = () => (


	<BrowserRouter>
		<Routes>
      <Route path="/" element = {<MainLayout/>}/>
			{/* <Route index element={<HomePage/>}/> */}
      <Route path="/createAthlete" element={<CreateAthletePage/>}/>
      {/* <Route path="*" element={<NotFoundPage/>}/> */}
		</Routes>
	</BrowserRouter>
);

export default App