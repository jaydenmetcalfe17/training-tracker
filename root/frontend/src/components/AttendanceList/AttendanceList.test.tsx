import AttendanceList from './AttendanceList';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { vi, describe, it, expect } from 'vitest';

const mockSession = {
  sessionId: 1,
  receivedAttendance: [
    {
      attendanceId: 1,
      individualComments: 'Good session',
      athlete: {
        athleteId: 1,
        athleteFirstName: 'Jayden',
        athleteLastName: 'Metcalfe',
      },
    },
  ],
};

const renderWithUser = (user: any) => {
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          user,
          newLogin: vi.fn(),
          logout: vi.fn(),
          isLoggedIn: vi.fn(() => true),
        }}
      >
        <AttendanceList session={mockSession as any} />
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('AttendanceList - isVisible role logic', () => {

  it('hides coach controls for athlete', () => {
    renderWithUser({
      userFirstName: 'Athlete',
      userLastName: 'User',
      email: 'athlete@test.com',
      status: 'athlete',
      athleteId: 1,
    });

    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
    // expect(screen.queryByTestId('add-attendance-button')).not.toBeInTheDocument();
  });

  it('hides coach controls for parent', () => {
    renderWithUser({
      userFirstName: 'Parent',
      userLastName: 'User',
      email: 'parent@test.com',
      status: 'parent',
      athleteId: 1,
    });

    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
  });

  it('shows coach controls for coach', () => {
    renderWithUser({
      userFirstName: 'Coach',
      userLastName: 'User',
      email: 'coach@test.com',
      status: 'coach',
      athleteId: 1,
    });

    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    expect(screen.getByTestId('add-attendance-button')).toBeInTheDocument();
  });

});