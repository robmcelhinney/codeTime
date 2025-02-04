import axios from "axios"
import fs from "fs"
import path from "path"
import { DateTime } from "luxon"

const CACHE_DIR = path.resolve("./cache")
const IS_DEV =
    process.env.NODE_ENV === "development" || process.env.USE_CACHE === "true"

console.log("process.env.NODE_ENV: ", process.env.NODE_ENV)

// Ensure the cache directory exists only in development mode
if (IS_DEV && !fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
}

export default async function handler(req, res) {
    const { username, since, timezone } = req.query
    if (!username) return res.status(400).json({ error: "Username required" })

    let sinceDate = since
        ? new Date(since)
        : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    sinceDate = sinceDate.toISOString().split("T")[0] // Convert to YYYY-MM-DD

    const userTimezone = timezone || "UTC"
    const CACHE_FILE = path.join(
        CACHE_DIR,
        `${username}_${sinceDate}_${userTimezone.replace(/\//g, "_")}.json`
    )

    console.log(
        `Received request: username=${username}, since=${sinceDate}, timezone=${userTimezone}`
    )

    // Use cache only in development mode
    if (IS_DEV && fs.existsSync(CACHE_FILE)) {
        console.log(`Serving cached data from ${CACHE_FILE}...`)
        const cachedData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
        return res.status(200).json(cachedData)
    }

    try {
        let allData = []
        let page = 1
        let hasMoreData = true

        while (hasMoreData) {
            console.log(`Fetching page ${page} from GitHub API...`)
            let { data } = await axios.get(
                `https://api.github.com/search/commits`,
                {
                    headers: {
                        Accept: "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                    params: {
                        q: `author:${username} committer-date:>=${sinceDate}`,
                        sort: "committer-date",
                        order: "desc",
                        per_page: 100,
                        page: page,
                    },
                }
            )

            console.log(`Fetched ${data.items.length} commits`)

            allData = allData.concat(data.items)

            if (data.items.length < 100) {
                hasMoreData = false
            } else {
                page++
            }
        }

        const result = {
            total_count: allData.length,
            items: allData.map((commit) => {
                const commitDate = DateTime.fromISO(commit.commit.author.date, {
                    zone: "UTC",
                }).setZone(userTimezone)
                return {
                    ...commit,
                    day_of_week: commitDate.weekday % 7,
                    hour: commitDate.hour,
                }
            }),
        }

        console.log(`Fetched ${result.total_count} total commits`)

        // Write to cache only in development mode
        if (IS_DEV) {
            fs.writeFileSync(
                CACHE_FILE,
                JSON.stringify(result.items, null, 2),
                "utf-8"
            )
        }

        res.status(200).json(result.items)
    } catch (error) {
        console.error(
            "GitHub API Error:",
            error.response?.data || error.message
        )
        res.status(error.response?.status || 500).json({ error: error.message })
    }
}
