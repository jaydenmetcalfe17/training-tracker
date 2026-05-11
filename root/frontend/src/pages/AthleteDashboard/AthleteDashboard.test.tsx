import AthleteDashboard from './AthleteDashboard';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AuthContext from '../../context/AuthContext';

globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          athlete_id: 1,
          athlete_first_name: 'Jayden',
          athlete_last_name: 'Metcalfe',
          birthday: '2001-03-10',
          gender: 'Female',
          team: 'Osler Bluff',
          age_group: 'FIS',
        },
      ]),
  })
) as any;

describe('AthleteDashboard', () => {
  it('hides coach controls from athletes', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider
            value={{
                user: {
                userFirstName: 'Jayden',
                userLastName: 'Metcalfe',
                email: 'test@test.com',
                status: 'athlete',
                athleteId: 1,
                },
                newLogin: vi.fn(),
                logout: vi.fn(),
                isLoggedIn: vi.fn(() => true),
            }}
        >
        <AthleteDashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
  });


  it('hides coach controls from parents', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider
            value={{
                user: {
                userFirstName: 'Jayden',
                userLastName: 'Metcalfe',
                email: 'test@test.com',
                status: 'parent',
                athleteId: 1,
                },
                newLogin: vi.fn(),
                logout: vi.fn(),
                isLoggedIn: vi.fn(() => true),
            }}
        >
        <AthleteDashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
  });

  it('shows coach controls for coach', async () => {
    render(
      <MemoryRouter>
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
        <AthleteDashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const button = await screen.findByTestId('back-button');
    expect(button).toBeInTheDocument();
  });



});


