// pages/api/github.js
import axios from "axios"

export default async function handler(req, res) {
    const { username } = req.query
    if (!username) return res.status(400).json({ error: "Username required" })

    try {
        const { data } = await axios.get(
            `https://api.github.com/users/${username}/events`,
            {
                headers: { Accept: "application/vnd.github+json" },
            }
        )
        res.status(200).json(data)
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message })
    }
}
