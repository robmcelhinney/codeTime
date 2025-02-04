// pages/api/github.js
import axios from "axios"

export default async function handler(req, res) {
    const { username, since } = req.query
    if (!username) return res.status(400).json({ error: "Username required" })

    const sinceDate = since || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()

    try {
        let allData = []
        let page = 1
        let hasMoreData = true

        while (hasMoreData) {
            let { data } = await axios.get(
                `https://api.github.com/search/commits`,
                {
                    headers: { 
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28"
                    },
                    params: {
                        q: `author:${username} committer-date:>=${sinceDate}`,
                        sort: 'committer-date',
                        order: 'desc',
                        per_page: 100,
                        page: page
                    }
                }
            )

            allData = allData.concat(data.items)

            if (data.items.length < 100) {
                hasMoreData = false
            } else {
                page++
            }
        }

        const result = {
            total_count: allData.length,
            items: allData.map(commit => ({
                ...commit,
                day_of_week: new Date(commit.commit.author.date).getUTCDay(),
                hour: new Date(commit.commit.author.date).getUTCHours()
            }))
        }

        res.status(200).json(result.items)
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message })
    }
}
