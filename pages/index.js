import { useState } from "react"
import Chart from "../components/Chart"
import WeekdayChart from "../components/WeekdayChart"
import axios from "axios"
import styles from '../styles/Home.module.css'

export default function Home() {
    const [username, setUsername] = useState("")
    const [hourlyData, setHourlyData] = useState(null)
    const [weekdayData, setWeekdayData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const processCommits = (commits) => {
        const hours = Array(24).fill(0)
        const weekdays = Array(7).fill(0)
        commits.forEach((commit) => {
            hours[commit.hour]++
            weekdays[commit.day_of_week]++
        })
        return { hours, weekdays }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get(`/api/github?username=${username}`)
            const data = res.data
            const { hours, weekdays } = processCommits(data)
            setHourlyData(hours)
            setWeekdayData(weekdays)
        } catch (err) {
            setError("Failed to fetch data.")
        }
        setLoading(false)
    }

    return (
        <div style={{ maxWidth: 800, margin: "auto", padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>GitHub Commit Patterns</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="GitHub Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ padding: "0.5rem", width: "70%", marginRight: "0.5rem" }}
                    required
                />
                <button type="submit" style={{ padding: "0.5rem 1rem" }}>
                    {loading ? "Crunching..." : "Go"}
                </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {hourlyData && (
                <div style={{ marginTop: "2rem" }}>
                    <h2>Hourly Commit Pattern</h2>
                    <Chart hourlyData={hourlyData} />
                </div>
            )}
            {weekdayData && (
                <div style={{ marginTop: "2rem" }}>
                    <h2>Weekly Commit Pattern</h2>
                    <WeekdayChart weekdayData={weekdayData} />
                </div>
            )}
        </div>
    )
}
