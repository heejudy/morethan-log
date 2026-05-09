import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end()
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body

  const password = body?.password
  if (
    !process.env.PASSWORD ||
    password?.trim() !== process.env.PASSWORD.trim()
  ) {
    return res.status(401).json({ ok: false })
  }

  await fetch(process.env.VERCEL_DEPLOY_HOOK!, {
    method: "POST",
  })

  return res.status(200).json({ ok: true })
}
