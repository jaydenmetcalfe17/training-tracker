// pages/CreateSessionPage.tsx

import { useState } from 'react';
import type { Session } from '../types/Session';
import SessionsList from '../components/SessionsList';
import CreateSessionForm from '../components/CreateSessionForm';

const CreateSessionPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

    // Create Session
	const createSession = (newSession: Session) => {
        
        fetch('/api/session', {
		// fetch('http://localhost:3000/api/session', {    // for when the vite.config.ts file is not redirecting to localhost:3000
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newSession),
		})
		.then((res) => res.json())
        .then((data) => {
            console.log('Session created:', data);
            setSessions([...sessions, newSession]);
        })
        .catch((err) => console.error('Failed to create session', err));
  };

  return (
    <div>
      <h1>Create Session</h1>
      <CreateSessionForm onSubmit={createSession} />
      <SessionsList sessions={sessions} />
    </div>
  );
}

export default CreateSessionPage