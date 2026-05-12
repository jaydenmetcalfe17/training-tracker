import SessionPage from './SessionPage';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AuthContext from '../../context/AuthContext';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../components/SessionsList/SessionsList', () => ({
  default: () => <div data-testid="sessions-list" />,
}));

vi.mock('../../components/AttendanceList/AttendanceList', () => ({
  default: () => <div data-testid="attendance-list" />,
}));

vi.mock('../../components/EditSessionForm', () => ({
  default: () => <div data-testid="edit-popup">Edit Popup</div>,
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
        snow_conditions: 'Icy',
        vis_conditions: 'Foggy',
        terrain_type: 'Mixed',
        num_freeski_runs: 3,
        num_drill_runs: 3,
        num_educational_course_runs: 3,
        num_gates_educational_course: 33,
        num_race_training_course_runs: 3,
        num_gates_race_training_course: 33,
        num_race_runs: 2,
        num_gates_race: 43,
        general_comments: 'Test w RTL',
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



describe('Session Page - testing edit session button leads to pop-up opening', () => {

  it('opens edit session popup when button is clicked', async () => {

    render(
      <MemoryRouter initialEntries={['/session/1']}>
        <AuthContext.Provider
          value={{
            user: {
              userFirstName: 'Jayden',
              userLastName: 'Metcalfe',
              email: 'test@test.com',
              status: 'coach',
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

    const user = userEvent.setup();

    const editButton = await screen.findByTestId('edit-button');

    await user.click(editButton);

    expect(screen.getByTestId('edit-popup')).toBeInTheDocument();

  });



    it.todo('opens delete confirmation popup when delete button clicked');

    it.todo('sends delete session request when delete is confirmed');
});