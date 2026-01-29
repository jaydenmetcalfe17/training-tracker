import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';

interface PieChartProps {
  selection: string;
}


const PieChart: React.FC<PieChartProps> = ({selection}) => {
    let availableColumns: any[] = [];

    if (selection = "sessions"){
       availableColumns = [
            { label: "Location", value: "location" },
            { label: "Discipline", value: "discipline" },
            { label: "Snow Conditions", value: "snowConditions" },
            { label: "Visibility Conditions", value: "visConditions" },
            { label: "Terrain Type", value: "terrainType" },
        ];
    } else if (selection = "athletes") {
        availableColumns = [
            { label: "Gender", value: "gender" },
        ];
    }

    const [selectedColumn, setSelectedColumn] = useState<string>(
        availableColumns[0]?.value || ""
    );
    const [labels, setLabels] = useState<string[]>([]);
    const [values, setValues] = useState<number[]>([]);


    ChartJS.register(ArcElement, Tooltip, Legend);


    useEffect(() => {
        fetch(`/api/data/${selectedColumn}`)
            .then((res) => {
            if (!res.ok) {
                throw new Error('Failed to load data');
            }
                return res.json();
            })
            .then((data) => {
                console.log('LOCATION DATA:', data);

                setLabels(data.labels);
                setValues(data.values);
            })
            .catch((err) => {
                console.error('Unable to load chart data:', err);
            });
    }, [selectedColumn]);

    const data = {
        labels,
        datasets: [
            {
            label: '# of Sessions',
            data: values,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
            },
        ],
    };

    return (
        <div>
            <div className="pie-chart-selector">
                <label htmlFor="column-select">Choose column: </label>
                <select
                    id="column-select"
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                >
                    {availableColumns.map((col) => (
                    <option key={col.value} value={col.value}>
                        {col.label}
                    </option>
                    ))}
                </select>
            </div>

            <Pie data={data} />
        </div>
    );
}

export default PieChart
