if (!process.env.GITHUB_ACTIONS) {
  require("dotenv").config()
}
const fs = require("fs")
const CACHE_PATH = ".notionsync/published.json"

function readCache() {
  if (!fs.existsSync(CACHE_PATH)) {
    return { pages: {} }
  }

  try {
    const raw = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"))
    if (raw?.pages && typeof raw.pages === "object") {
      return raw
    }

    if (Array.isArray(raw?.pageIds)) {
      const pages = {}
      raw.pageIds.forEach((id) => {
        pages[id] = null
      })
      return { pages }
    }
  } catch {
    return { pages: {} }
  }

  return { pages: {} }
}

async function run() {
  const prevCache = readCache()
  const prevPages = prevCache.pages || {}

  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "status",
          select: { equals: "Public" },
        },
      }),
    }
  )

  console.log("DATABASE_ID:", process.env.NOTION_DATABASE_ID)

  const data = await res.json()
  // console.dir(data, { depth: null })

  if (!Array.isArray(data.results)) {
    console.log("No valid results from Notion API. Skip deploy.")
    process.exit(0)
  }

  const current = data.results.map((page) => ({
    id: page.id,
    updatedAt: page.last_edited_time,
  }))

  const currentPages = {}
  current.forEach((page) => {
    currentPages[page.id] = page.updatedAt
  })

  const hasNew = current.some((page) => !prevPages[page.id])
  const hasUpdated = current.some(
    (page) => prevPages[page.id] && prevPages[page.id] !== page.updatedAt
  )

  if (!hasNew && !hasUpdated) {
    console.log("No new or updated public posts. Skip deploy.")
    process.exit(0)
  }

  if (hasNew) {
    console.log("✨ New public posts detected")
  } else {
    console.log("✨ Updated public posts detected")
  }
  await fetch(process.env.VERCEL_DEPLOY_HOOK, { method: "POST" })
  fs.writeFileSync(CACHE_PATH, JSON.stringify({ pages: currentPages }, null, 2))
}

run()
