import { NextApiRequest, NextApiResponse } from "next"
import { notionClient } from "../../apis/notion-client/notion"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const blockId = req.query.blockId as string
  if (!blockId) return res.status(400).json({ error: "Missing blockId" })

  try {
    const block = (await notionClient.blocks.retrieve({
      block_id: blockId,
    })) as any

    if (block.type !== "video" || block.video?.type !== "file") {
      return res.status(404).json({ error: "Not a file video block" })
    }

    const url = block.video.file.url
    if (!url) return res.status(404).json({ error: "No URL found" })

    // 브라우저가 직접 S3에서 스트리밍할 수 있도록 리다이렉트
    res.setHeader("Cache-Control", "no-store")
    res.redirect(302, url)
  } catch {
    return res.status(500).json({ error: "Failed to fetch video URL" })
  }
}
