import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js"

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function WeekdayChart({ weekdayData }) {
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const data = {
        labels: weekdayLabels,
        datasets: [
            {
                label: "Commits per Day",
                data: weekdayData,
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
            },
        ],
    }

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    }

    return <Bar data={data} options={options} />
}
