import SessionPage from './SessionPage';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../components/SessionsList/SessionsList', () => ({
  default: () => <div data-testid="sessions-list" />,
}));

vi.mock('../../components/AttendanceList/AttendanceList', () => ({
  default: () => <div data-testid="attendance-list" />,
}));


globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        session_id: 1,
        session_day: '2026-01-01',
        start_time: '10:00:00',
        end_time: '12:00:00',
        location: 'Hill',
        discipline: 'GS',
        snow_conditions: '',
        vis_conditions: '',
        terrain_type: '',
        num_freeski_runs: 0,
        num_drill_runs: 0,
        num_educational_course_runs: 0,
        num_gates_educational_course: 0,
        num_race_training_course_runs: 0,
        num_gates_race_training_course: 0,
        num_race_runs: 0,
        num_gates_race: 0,
        general_comments: '',
        attendance: [],
      }),
  })
) as any;

const renderPage = (status: string) => {
  render(
    <MemoryRouter initialEntries={['/session/1']}>
      <AuthContext.Provider
        value={{
          user: {
            userFirstName: 'Test',
            userLastName: 'User',
            email: 'test@test.com',
            status,
            athleteId: 1,
          },
          newLogin: vi.fn(),
          logout: vi.fn(),
          isLoggedIn: vi.fn(() => true),
        }}
      >
        <Routes>
          <Route path="/session/:sessionId" element={<SessionPage />} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('SessionPage - coach-only visibility', () => {

  it('hides AttendanceList for athlete (isVisible = false)', async () => {
    renderPage('athlete');

    await waitFor(() => {
      expect(screen.getByTestId('sessions-list')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('attendance-list')).not.toBeInTheDocument();
  });

  it('hides AttendanceList for parent (isVisible = false)', async () => {
    renderPage('parent');

    await waitFor(() => {
      expect(screen.getByTestId('sessions-list')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('attendance-list')).not.toBeInTheDocument();
  });

  it('shows AttendanceList for coach (isVisible = true)', async () => {
    renderPage('coach');

    await waitFor(() => {
      expect(screen.getByTestId('attendance-list')).toBeInTheDocument();
    });
  });

});