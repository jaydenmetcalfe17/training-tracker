// components/AthletesList/AthletesList.tsx

import "./AthletesList.scss";
import type { Athlete } from "../../types/Athlete";
import { useNavigate } from "react-router-dom";
import SortableTable from "../SortableTable/SortableTable";

interface AthleteListProps {
  athletes: Athlete[];
}

interface AthleteTableRow {
  athleteId?: number;
  athleteFirstName: string;
  athleteLastName: string;
  birthday: string;
  gender: string;
  team: string;
  club: string;
  ageGroup: string;
}

const AthletesList: React.FC<AthleteListProps> = ({
  athletes,
}) => {
  const navigate = useNavigate();

  const tableData: AthleteTableRow[] = athletes
    .map((athlete) => {
      const currentMembership =
        athlete.teamMemberships?.[0];

      return {
        athleteId: athlete.athleteId,
        athleteFirstName: athlete.athleteFirstName,
        athleteLastName: athlete.athleteLastName,
        birthday: athlete.birthday,
        gender: athlete.gender,
        team: currentMembership?.team?.name ?? "",
        club: currentMembership?.team?.club?.name ?? "",
        ageGroup: athlete.ageGroup ?? "",
      };
    })
    .sort((a, b) =>
      a.athleteFirstName.localeCompare(b.athleteFirstName)
    );

  const headers: {
    key: keyof AthleteTableRow;
    label: string;
  }[] = [
    {
      key: "athleteFirstName",
      label: "First Name",
    },
    {
      key: "athleteLastName",
      label: "Last Name",
    },
    {
      key: "birthday",
      label: "Birthday",
    },
    {
      key: "gender",
      label: "Gender",
    },
    {
      key: "club",
      label: "Club",
    },
    {
      key: "team",
      label: "Team",
    },
    {
      key: "ageGroup",
      label: "Age Group",
    },
  ];

  return (
    <SortableTable
      headers={headers}
      data={tableData}
      onRowClick={(athlete) =>
        navigate(
          `/athlete/${athlete.athleteId}`
        )
      }
    />
  );
};

export default AthletesList;