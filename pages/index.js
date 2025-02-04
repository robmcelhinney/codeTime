import { useState, useEffect } from "react"
import Chart from "../components/Chart"
import WeekdayChart from "../components/WeekdayChart"
import axios from "axios"

export default function Home() {
    const [username, setUsername] = useState("")
    const [since, setSince] = useState(getDefaultDate()) // Default to 1 year ago
    const [hourlyData, setHourlyData] = useState(null)
    const [weekdayData, setWeekdayData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [timezone, setTimezone] = useState("UTC") // Safe default for SSR

    useEffect(() => {
        const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        setTimezone(clientTimezone) // Set actual timezone on client load
    }, [])

    function getDefaultDate() {
        const date = new Date()
        date.setFullYear(date.getFullYear() - 1)
        return date.toISOString().split("T")[0]
    }

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
            const res = await axios.get(
                `/api/github?username=${username}&since=${since}&timezone=${timezone}`
            )
            const data = res.data
            const { hours, weekdays } = processCommits(data)
            setHourlyData(hours)
            setWeekdayData(weekdays)
        } catch (err) {
            console.error("API Error:", err.response?.data || err.message)
            setError("Failed to fetch data.")
        }
        setLoading(false)
    }

    return (
        <div
            style={{
                maxWidth: 800,
                margin: "auto",
                padding: "2rem",
                fontFamily: "sans-serif",
            }}
        >
            <h1>GitHub Commit Patterns</h1>
            <p style={{ fontSize: "0.9rem", color: "gray" }}>
                📌 Note: This only includes commits to the repository's
                **default branch** (e.g., `main` or `master`).
            </p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="GitHub Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        padding: "0.5rem",
                        width: "50%",
                        marginRight: "0.5rem",
                    }}
                    required
                />
                <input
                    type="date"
                    value={since}
                    onChange={(e) => setSince(e.target.value)}
                    style={{ padding: "0.5rem", marginRight: "0.5rem" }}
                />
                <button type="submit" style={{ padding: "0.5rem 1rem" }}>
                    {loading ? "Crunching..." : "Go"}
                </button>
            </form>
            <p>
                Timezone detected: <strong>{timezone}</strong>
            </p>
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
