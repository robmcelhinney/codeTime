// pages/index.js
import { useState } from "react"
import Chart from "../components/Chart"
import axios from "axios"

export default function Home() {
    const [username, setUsername] = useState("")
    const [hourlyData, setHourlyData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Process events to count commits per hour
    const processEvents = (events) => {
        const hours = Array(24).fill(0)
        events.forEach((event) => {
            if (event.type === "PushEvent") {
                // Each push event may have multiple commits; count each occurrence at event creation time.
                const eventHour = new Date(event.created_at).getHours()
                hours[eventHour] += event.payload.commits.length
            }
        })
        return hours
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await axios.get(`/api/github?username=${username}`)
            const data = res.data
            const hourly = processEvents(data)
            setHourlyData(hourly)
        } catch (err) {
            setError("Failed to fetch data.")
        }
        setLoading(false)
    }

    return (
        <div
            style={{
                maxWidth: 600,
                margin: "auto",
                padding: "2rem",
                fontFamily: "sans-serif",
            }}
        >
            <h1>GitHub Commit Chronogram</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="GitHub Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        padding: "0.5rem",
                        width: "70%",
                        marginRight: "0.5rem",
                    }}
                    required
                />
                <button type="submit" style={{ padding: "0.5rem 1rem" }}>
                    {loading ? "Crunching..." : "Go"}
                </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {hourlyData && (
                <div style={{ marginTop: "2rem" }}>
                    <Chart hourlyData={hourlyData} />
                </div>
            )}
        </div>
    )
}
