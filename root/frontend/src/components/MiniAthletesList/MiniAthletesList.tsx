// components/MiniAthletesList/MiniAthletesList.tsx

import type { Athlete } from "../../types/Athlete";
import { useNavigate } from "react-router-dom";
import SortableTable from "../SortableTable/SortableTable";

interface AthleteListProps {
  athletes: Athlete[];
}

interface AthleteTableRow {
  athleteId?: number;
  name: string;
  team: string;
}

const MiniAthletesList: React.FC<AthleteListProps> = ({
  athletes,
}) => {
  const navigate = useNavigate();

  const tableData: AthleteTableRow[] = athletes
    .map((athlete) => {
      const teams =
        athlete.teamMemberships
          ?.map(
            (membership) =>
              membership.team?.name
          )
          .filter(Boolean)
          .join(", ") ?? "";

      return {
        athleteId: athlete.athleteId,

        name: `${athlete.athleteFirstName} ${athlete.athleteLastName}`,

        team: teams,
      };
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );

  const headers: {
    key: keyof AthleteTableRow;
    label: string;
  }[] = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "team",
      label: "Team",
    },
  ];

  return (
    <div className="mini-athletes-table">
      <SortableTable
        headers={headers}
        data={tableData}
        onRowClick={(athlete) =>
          navigate(
            `/athlete/${athlete.athleteId}`
          )
        }
      />
    </div>
  );
};

export default MiniAthletesList;

