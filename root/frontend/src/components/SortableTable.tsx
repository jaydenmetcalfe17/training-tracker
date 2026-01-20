import React, { useMemo, useState} from 'react'

interface SortableTableProps<T extends object> {
  headers: { key: keyof T; label: string }[]
  data: T[]
  onRowClick?: (row: T) => void
}

type SortOrder = "ascn" | "desc";

function SortButton<T extends object>({
    sortOrder,
    columnKey,
    sortKey,
    onClick,
  }: {
    sortOrder: SortOrder;
    columnKey: keyof T;
    sortKey: keyof T | null;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
  }) {
    return (
      <button
        onClick={onClick}
        className={
          sortKey === columnKey && sortOrder === "desc"
            ? "sort-button sort-reverse"
            : "sort-button"
        }
      >
        ▲
      </button>
    );
  }


function SortableTable<T extends object>(
  { headers, data, onRowClick }: SortableTableProps<T>
) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("ascn")

  const sortedData = useMemo(() => {
    if (!sortKey) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (aVal == null || bVal == null) return 0
      if (aVal > bVal) return sortOrder === "ascn" ? 1 : -1
      if (aVal < bVal) return sortOrder === "ascn" ? -1 : 1
      return 0
    })
  }, [data, sortKey, sortOrder])


  const changeSort = (key: keyof T) => {
    setSortOrder(prev =>
      sortKey === key && prev === "ascn" ? "desc" : "ascn"
    );
    setSortKey(key);
  };


  return (
    <div className="sessions-list-box">
      <div className="light-tan-box">
        {/* <h2 className="box-h2-title">All Sessions</h2> */}
        <div className="white-box" id="sessions-white-box">
          <table>
            <thead>
              <tr>
                {headers.map(h => (
                  <th key={String(h.key)}>
                    {h.label}
                    <SortButton<T>
                      columnKey={h.key}
                      sortKey={sortKey}
                      sortOrder={sortOrder}
                      onClick={() => changeSort(h.key)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                >
                  {headers.map((h) => {
                    const value = row[h.key];

                    return (
                      <td key={String(h.key)}>
                        {value == null
                          ? ""
                          : value instanceof Date
                          ? value.toLocaleDateString()
                          : String(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

          </table>
         </div>
      </div>
    </div>
  );
};

export default SortableTable