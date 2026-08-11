//components/SessionFilter/SessionFilter.test.tsx

import SessionFilter from './SessionFilter';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import AuthContext from '../../context/AuthContext';


vi.mock('../PieChart/PieChart', () => ({
  default: () => <div data-testid="mock-pie-chart" />,
}));


globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as any;

const mockAthlete = {
  athleteId: 1,
  athleteFirstName: 'Jayden',
  athleteLastName: 'Metcalfe',
  birthday: '2001-03-10',
  gender: 'Feale',
  team: 'Osler Bluff',
  ageGroup: 'FIS',
};

describe('SessionFilter - role based rendering', () => {

  it('shows coach-only controls for coach', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: {
              userFirstName: 'Coach',
              userLastName: 'User',
              email: 'coach@test.com',
              status: 'coach',
              athleteId: 1,
            },
            newLogin: vi.fn(),
            logout: vi.fn(),
            isLoggedIn: vi.fn(() => true),
          }}
        >
          <SessionFilter athlete={mockAthlete} />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(
      await screen.findByTestId('edit-athlete-button')
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('delete-athlete-button')
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('generate-invite-button')
    ).toBeInTheDocument();
  });

  it('hides coach-only controls from athlete', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: {
              userFirstName: 'Athlete',
              userLastName: 'User',
              email: 'athlete@test.com',
              status: 'athlete',
              athleteId: 1,
            },
            newLogin: vi.fn(),
            logout: vi.fn(),
            isLoggedIn: vi.fn(() => true),
          }}
        >
          <SessionFilter athlete={mockAthlete} />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(
      screen.queryByTestId('edit-athlete-button')
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId('delete-athlete-button')
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId('generate-invite-button')
    ).not.toBeInTheDocument();
  });

  it('opens edit athlete popup when edit button clicked', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: {
              userFirstName: 'Coach',
              userLastName: 'User',
              email: 'coach@test.com',
              status: 'coach',
              athleteId: 1,
            },
            newLogin: vi.fn(),
            logout: vi.fn(),
            isLoggedIn: vi.fn(() => true),
          }}
        >
          <SessionFilter athlete={mockAthlete} />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const user = userEvent.setup();

    const editButton = await screen.findByTestId(
      'edit-athlete-button'
    );

    await user.click(editButton);

    expect(
      await screen.findByTestId('edit-athlete-popup')
    ).toBeInTheDocument();
  });
  

  it.todo('submits filter form and fetches sessions');

  it.todo('opens delete confirmation popup when delete button clicked');

  it.todo('sends delete athlete request when delete is confirmed');
});