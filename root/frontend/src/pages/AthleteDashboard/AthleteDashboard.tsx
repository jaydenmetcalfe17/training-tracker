// pages/AthleteDashboard.tsx

import AthletesSessions from "../../components/AthletesSessions/AthletesSessions";
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import type { Athlete } from "../../types/Athlete";
import { useNavigate, useParams } from "react-router-dom";

import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

import "./AthleteDashboard.scss";

const AthleteDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const params = useParams();

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const isVisible = (user?.status === 'coach');

  useEffect(() => {
    let insert = '';

    if (user?.status === 'coach') {
      insert = `athleteId=${params.athleteId}`;
    } else if (
      user?.status === 'athlete' ||
      user?.status === 'parent'
    ) {
      console.log(
        "IN HERE! athleteid: ",
        user?.athleteId,
        "this user is a: ",
        user?.status
      );

      insert = `athleteId=${user?.athleteId}`;
    }

    fetch(`/api/athlete?${insert}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to find athlete');
        }

        return res.json();
      })
      .then((data) => {
        console.log("DATA: ", data);

        const mappedAthlete: Athlete = {
          athleteId: data.athlete_id,

          athleteFirstName:
            data.athlete_first_name,

          athleteLastName:
            data.athlete_last_name,

          birthday:
            data.birthday,

          gender:
            data.gender,

          acaId:
            data.aca_id,

          fisId:
            data.fis_id,

          ageGroup:
            data.age_group,

          teamMemberships:
            (data.team_memberships ?? []).map(
              (membership: any) => ({
                teamMembershipId:
                  membership.team_membership_id,

                athleteId:
                  membership.athlete_id,

                teamId:
                  membership.team_id,

                startDate:
                  membership.start_date,

                endDate:
                  membership.end_date,

                team: membership.team
                  ? {
                      teamId:
                        membership.team.team_id,

                      clubId:
                        membership.team.club_id,

                      name:
                        membership.team.name,

                      club: membership.team.club
                        ? {
                            clubId:
                              membership.team.club.club_id,

                            name:
                              membership.team.club.name,
                          }
                        : undefined,
                    }
                  : undefined,
              })
            ),
        };

        setAthlete(mappedAthlete);

        console.log(
          'Athlete found:',
          mappedAthlete
        );
      })
      .catch((err) =>
        console.log(
          'Unable to find athlete: ',
          err
        )
      );
  }, [user]);

  const handleClick = () => {
    navigate(`/dashboard`);
  };

  if (!athlete) return <>Loading...</>;

  return (
    <div className="athlete-dashboard-wrapper">
      <div className="coach-only-buttons-box"> 
        {isVisible && (
          <button
            className="main-button"
            id="athlete-back-button"
            aria-label="back-button"
            data-testid="back-button"
            onClick={() => handleClick()}
          >
            <KeyboardBackspaceIcon />
          </button>
        )}
      </div>
      <AthletesSessions athlete={athlete} />
    </div>
  );
};

export default AthleteDashboard;