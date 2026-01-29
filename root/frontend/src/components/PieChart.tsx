import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';




const PieChart: React.FC = () => {

    const [labels, setLabels] = useState<string[]>([]);
    const [values, setValues] = useState<number[]>([]);


    ChartJS.register(ArcElement, Tooltip, Legend);


    useEffect(() => {
    fetch('/api/data')
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
    }, []);




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
        <Pie data={data} />
    );
}

export default PieChart
