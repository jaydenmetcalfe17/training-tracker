// components/MiniSessionsList/MiniSessionsList.tsx

import type { Session } from "../../types/Session";
import { useNavigate } from "react-router-dom";
import SortableTable from "../SortableTable/SortableTable";

interface SessionListProps {
  sessions: Session[];
}

interface SessionTableRow {
  sessionId?: number;
  sessionDay: string;
  location: string;
  teams: string;
}

const MiniSessionsList: React.FC<SessionListProps> = ({
  sessions,
}) => {
  const navigate = useNavigate();

  const tableData: SessionTableRow[] = [...sessions]
    .map((session) => ({
      sessionId: session.sessionId,

      sessionDay: session.sessionDay,

      location: session.location ?? "",

      // This assumes Session will eventually have a teams
      // property containing the teams associated with the session.
      teams:
        session.teams
          ?.map((team) => team.name)
          .join(", ") ?? "",
    }))
    .sort(
      (a, b) =>
        new Date(b.sessionDay).getTime() -
        new Date(a.sessionDay).getTime()
    );

  const headers: {
    key: keyof SessionTableRow;
    label: string;
  }[] = [
    {
      key: "sessionDay",
      label: "Date",
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "teams",
      label: "Team(s)",
    },
  ];

  return (
    <SortableTable
      headers={headers}
      data={tableData}
      onRowClick={(session) =>
        navigate(
          `/session/${session.sessionId}`
        )
      }
    />
  );
};

export default MiniSessionsList;
