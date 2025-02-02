// components/Chart.js
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

export default function Chart({ hourlyData }) {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    const data = {
        labels,
        datasets: [
            {
                label: "Commits per hour",
                data: hourlyData, // Expect an array of 24 numbers.
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
        ],
    }

    return <Bar data={data} />
}
