// components/AthleteList.tsx
import "./SessionsList.scss";
import type { Session } from "../../types/Session";
import SortableTable from "../SortableTable";
import { useNavigate } from "react-router-dom";

interface SessionListProps {
  sessions: Session[];
};

const SessionsList: React.FC<SessionListProps> = ({ sessions }) => { 
  console.log("found sessions: ", sessions);

  const navigate = useNavigate();

  const headers: { key: keyof Session; label: string }[] = [
    {key: "sessionDay", label: "Date"},
    {key: "startTime", label: "Start Time"},
    {key: "endTime", label: "End Time"},
    {key: "location", label: "Location"},
    {key: "discipline", label: "Discipline"},
    {key: "snowConditions", label: "Snow Conditions"},
    {key: "visConditions", label: "Visibility Conditions"},
    {key: "terrainType", label: "Terrain Type"},
    {key: "numDrillRuns", label: "# of Drill Runs"},
    {key: "numFreeskiRuns", label: "# of Freeski Runs"},
    {key: "numEducationalCourseRuns", label: "# of Educational Course Runs"},
    {key: "numGatesEducationalCourse", label: "# of Gates in Educational Course"},
    {key: "numRaceTrainingCourseRuns", label: "# of Training Course Runs"},
    {key: "numGatesRaceTrainingCourse", label: "# of Gates in Training Course"},
    {key: "numRaceRuns", label: "# of Race Runs"},
    {key: "numGatesRace", label: "# of Gates in Race"},
    {key: "generalComments", label: "General Comments"},
  ];

  return (
    <div>
      <SortableTable<Session> headers={headers} data={sessions} onRowClick={(session) => navigate(`/session/${session.sessionId}`)} />
    </div>
  );
};

export default SessionsList




// type SortKeys = keyof Session;
// type SortOrder = "ascn" | "desc";


// const SessionsList: React.FC<SessionListProps> = ({ sessions }) => {
//   console.log("found sessions: ", sessions);
 

//   const [sortKey, setSortKey] = useState<SortKeys>("sessionDay");
//   const [sortOrder, setSortOrder] = useState<SortOrder>("ascn");

//   function sortData({tableData, sortKey, reverse}:{
//     tableData: Session[];
//     sortKey: SortKeys;
//     reverse: boolean;
//   }){
//     const sorted = [...tableData].sort((a, b) => {
//       const aVal = a[sortKey];
//       const bVal = b[sortKey];

//       if (aVal == null) return 1;
//       if (bVal == null) return -1;

//       if (aVal > bVal) return 1;
//       if (aVal < bVal) return -1;
//       return 0;
//     });

//   return reverse ? sorted.reverse() : sorted;
// }

// function SortButton({
//   sortOrder,
//   columnKey,
//   sortKey,
//   onClick,
// }: {
//   sortOrder: SortOrder;
//   columnKey: SortKeys;
//   sortKey: SortKeys;
//   onClick: MouseEventHandler<HTMLButtonElement>;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`${
//         sortKey === columnKey && sortOrder === "desc"
//           ? "sort-button sort-reverse"
//           : "sort-button"
//       }`}
//     >
//       ▲
//     </button>
//   );
// }

//   const sortedData = useCallback(
//     () => sortData({tableData: sessions, sortKey, reverse: sortOrder === "desc"}), 
//     [sessions, sortKey, sortOrder]
//   );

//   function changeSort(key: SortKeys) {
//     setSortOrder(sortOrder === "ascn" ? "desc" : "ascn");
//     setSortKey(key);
//   }


//   const navigate = useNavigate();

//   const handleRowClick = (sessionId: number | undefined) => {
//     navigate(`/session/${sessionId}`);
//   };

//   const headers: { key: keyof Session; label: string }[] = [
//     {key: "sessionDay", label: "Date"},
//     {key: "startTime", label: "Start Time"},
//     {key: "endTime", label: "End Time"},
//     {key: "location", label: "Location"},
//     {key: "discipline", label: "Discipline"},
//     {key: "snowConditions", label: "Snow Conditions"},
//     {key: "visConditions", label: "Visibility Conditions"},
//     {key: "terrainType", label: "Terrain Type"},
//     {key: "numDrillRuns", label: "# of Drill Runs"},
//     {key: "numFreeskiRuns", label: "# of Freeski Runs"},
//     {key: "numEducationalCourseRuns", label: "# of Educational Course Runs"},
//     {key: "numGatesEducationalCourse", label: "# of Gates in Educational Course"},
//     {key: "numRaceTrainingCourseRuns", label: "# of Training Course Runs"},
//     {key: "numGatesRaceTrainingCourse", label: "# of Gates in Training Course"},
//     {key: "numRaceRuns", label: "# of Race Runs"},
//     {key: "numGatesRace", label: "# of Gates in Race"},
//     {key: "generalComments", label: "General Comments"},
//   ];

//   return (
//     <div className="sessions-list-box">
//       <div className="light-tan-box">
//         {/* <h2 className="box-h2-title">All Sessions</h2> */}
//         <div className="white-box" id="sessions-white-box">
//           <table>
//             <thead>
//               <tr>
//                 {headers.map((row) => {
//                   return (
//                     <td key={row.key}>{row.label}{" "}
//                     <SortButton
//                       columnKey={row.key}
//                       onClick={() => changeSort(row.key)}
//                       {...{
//                         sortOrder,
//                         sortKey,
//                       }}
//                     />
//                   </td>
//                   );
//                 })}
//               </tr>
//             </thead>
            
//             <tbody>
//               {sortedData().map((session, index) => (
//                 <tr key={index} onClick={() => handleRowClick(session.sessionId)}>
//                   <td>{session.sessionDay}</td>
//                   <td>{session.startTime}</td>
//                   <td>{session.endTime}</td>
//                   <td>{session.location}</td>
//                   <td>{session.discipline}</td>
//                   <td>{session.snowConditions}</td>
//                   <td>{session.visConditions}</td>
//                   <td>{session.terrainType}</td>
//                   <td>{session.numDrillRuns}</td>
//                   <td>{session.numFreeskiRuns}</td>
//                   <td>{session.numEducationalCourseRuns}</td>
//                   <td>{session.numGatesEducationalCourse}</td>
//                   <td>{session.numRaceTrainingCourseRuns}</td>
//                   <td>{session.numGatesRaceTrainingCourse}</td>
//                   <td>{session.numRaceRuns}</td>
//                   <td>{session.numGatesRace}</td>
//                   <td>{session.generalComments}</td>
//                 </tr>
//               ))}
//             </tbody>

//           </table>
//          </div>
//       </div>
//     </div>
//   );
// };

