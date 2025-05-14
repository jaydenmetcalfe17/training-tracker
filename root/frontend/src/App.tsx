// import { useState } from 'react'
import { Route, BrowserRouter, Routes} from 'react-router-dom'
import './assets/css/App.css'
import MainLayout from './layout/MainLayout'


const App: React.FC = () => (
	<BrowserRouter>
		<Routes>
      <Route path="/" element = {<MainLayout/>}/>
			{/* <Route index element={<HomePage/>}/> */}
      {/* <Route path="/jobs" element={<JobsPage/>}/> */}
      {/* <Route path="*" element={<NotFoundPage/>}/> */}
		</Routes>
	</BrowserRouter>
);

export default App