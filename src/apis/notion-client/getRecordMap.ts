import { NotionToMarkdown } from "notion-to-md"
import { marked } from "marked"
import { notionClient } from "./notion"

const n2m = new NotionToMarkdown({ notionClient })

const escapeInlineHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

;(n2m as any).annotatePlainText = (
  text: string,
  annotations: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
    color?: string
  }
) => {
  if (text.match(/^\s*$/)) return text

  const leadingSpaceMatch = text.match(/^(\s*)/)
  const trailingSpaceMatch = text.match(/(\s*)$/)
  const leadingSpace = leadingSpaceMatch ? leadingSpaceMatch[0] : ""
  const trailingSpace = trailingSpaceMatch ? trailingSpaceMatch[0] : ""
  let content = text.trim()

  if (content !== "") {
    content = escapeInlineHtml(content)
    if (annotations.code) content = `<code>${content}</code>`
    if (annotations.bold) content = `<strong>${content}</strong>`
    if (annotations.italic) content = `<em>${content}</em>`
    if (annotations.strikethrough) content = `<del>${content}</del>`
    if (annotations.underline) content = `<u>${content}</u>`

    const color =
      annotations.color && annotations.color !== "default"
        ? annotations.color
        : null
    if (color) {
      content = `<span class="notion-color-${color}">${content}</span>`
    }
  }

  return leadingSpace + content + trailingSpace
}

const listAllBlockChildren = async (blockId: string) => {
  const results: any[] = []
  let cursor: string | undefined

  do {
    const response = await notionClient.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    })
    results.push(...response.results)
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined
  } while (cursor)

  return results
}

const toMarkdownString = async (blocks: any[]) => {
  const mdBlocks = await n2m.blocksToMarkdown(blocks)
  const markdown = n2m.toMarkdownString(mdBlocks)
  return markdown.parent || ""
}

const renderRichText = (richText: any[] = []) => {
  return richText
    .map((item) => {
      const text = (n2m as any).annotatePlainText(
        item?.plain_text || "",
        item?.annotations || {}
      )
      if (item?.href) {
        return `<a href="${escapeHtml(
          item.href
        )}" target="_blank" rel="noopener noreferrer">${text}</a>`
      }
      return text
    })
    .join("")
}

const toBlockquote = (text: string) => {
  const trimmed = text.trim()
  if (!trimmed) return ""
  return `> ${trimmed.replace(/\n/g, "\n> ")}`
}

const escapeTableCell = (value: string) =>
  value.replace(/\|/g, "\\|").replace(/\n+/g, "<br />")

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

const parseImageCaption = (caption: string) => {
  const widthMatch = caption.match(/\b(?:w|width)\s*[:=]\s*([\d.]+%|\d+px)\b/i)
  const width = widthMatch?.[1]
  const cleaned = caption
    .replace(/\b(?:w|width)\s*[:=]\s*([\d.]+%|\d+px)\b/i, "")
    .trim()
  return { width, caption: cleaned }
}

export const mapNotionImageUrl = (url: string, blockId?: string) => {
  if (!url || !blockId) return url
  if (url.startsWith("data:")) return url

  // Unsplash images should remain direct and unproxied.
  if (url.startsWith("https://images.unsplash.com")) return url

  try {
    const parsed = new URL(url)
    const isNotionS3 =
      parsed.hostname.endsWith(".amazonaws.com") &&
      (parsed.pathname.startsWith("/secure.notion-static.com") ||
        parsed.hostname.startsWith("prod-files-secure.") ||
        parsed.hostname.startsWith("s3.us-west-2.") ||
        parsed.hostname.startsWith("s3-us-west-2."))

    if (
      isNotionS3 &&
      parsed.searchParams.has("X-Amz-Signature")
    ) {
      // Strip signatures before proxying; signatures are time-bound.
      url = parsed.origin + parsed.pathname
    }
  } catch {
    return url
  }

  if (url.startsWith("/images")) {
    url = `https://www.notion.so${url}`
  }

  const isNotionProxy =
    url.startsWith("https://www.notion.so/image/") ||
    url.startsWith("http://www.notion.so/image/")
  const proxyBase = isNotionProxy
    ? url
    : `https://www.notion.so${
        url.startsWith("/image") ? url : `/image/${encodeURIComponent(url)}`
      }`
  const notionImageUrl = new URL(proxyBase)
  notionImageUrl.searchParams.set("table", "block")
  notionImageUrl.searchParams.set("id", blockId)
  notionImageUrl.searchParams.set("cache", "v2")

  return notionImageUrl.toString()
}

type BookmarkMeta = {
  title?: string
  description?: string
  image?: string
  url?: string
}

const bookmarkMetaCache = new Map<string, BookmarkMeta>()

const readMetaTag = (html: string, selector: RegExp) => {
  const match = html.match(selector)
  return match?.[1]?.trim()
}

const fetchBookmarkMeta = async (url: string): Promise<BookmarkMeta> => {
  if (bookmarkMetaCache.has(url)) {
    return bookmarkMetaCache.get(url) || { url }
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Notion Bookmark Bot)",
      },
    })

    if (!response.ok) {
      const fallback: BookmarkMeta = { url }
      bookmarkMetaCache.set(url, fallback)
      return fallback
    }

    const html = await response.text()
    const title =
      readMetaTag(
        html,
        /property=["']og:title["']\s+content=["']([^"']+)["']/i
      ) ||
      readMetaTag(
        html,
        /name=["']twitter:title["']\s+content=["']([^"']+)["']/i
      ) ||
      readMetaTag(html, /<title>([^<]+)<\/title>/i)

    const description =
      readMetaTag(
        html,
        /property=["']og:description["']\s+content=["']([^"']+)["']/i
      ) ||
      readMetaTag(
        html,
        /name=["']description["']\s+content=["']([^"']+)["']/i
      ) ||
      readMetaTag(
        html,
        /name=["']twitter:description["']\s+content=["']([^"']+)["']/i
      )

    const image =
      readMetaTag(
        html,
        /property=["']og:image["']\s+content=["']([^"']+)["']/i
      ) ||
      readMetaTag(
        html,
        /name=["']twitter:image["']\s+content=["']([^"']+)["']/i
      )

    const meta: BookmarkMeta = {
      title,
      description,
      image,
      url,
    }

    bookmarkMetaCache.set(url, meta)
    return meta
  } catch {
    const fallback: BookmarkMeta = { url }
    bookmarkMetaCache.set(url, fallback)
    return fallback
  }
}

n2m.setCustomTransformer("bookmark", async (block: any) => {
  const url = block?.bookmark?.url
  if (!url) return ""

  const meta = await fetchBookmarkMeta(url)
  const caption = block?.bookmark?.caption
    ?.map((item: any) => item.plain_text)
    .join("")
    .trim()

  const title = caption || meta?.title || url
  const description = meta?.description || ""
  const image = meta?.image

  let hostname = url
  try {
    hostname = new URL(url).hostname
  } catch {
    hostname = url
  }

  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeHostname = escapeHtml(hostname)
  const safeUrl = escapeHtml(url)

  const thumb = image
    ? `<div class="notion-bookmark-thumb"><img src="${escapeHtml(
        image
      )}" alt="" /></div>`
    : ""

  return `<div class="notion-bookmark"><a href="${safeUrl}" target="_blank" rel="noopener noreferrer"><div class="notion-bookmark-content"><div class="notion-bookmark-title">${safeTitle}</div>${
    safeDescription
      ? `<div class="notion-bookmark-desc">${safeDescription}</div>`
      : ""
  }<div class="notion-bookmark-url">${safeHostname}</div></div>${thumb}</a></div>`
})

n2m.setCustomTransformer("image", async (block: any) => {
  const image = block?.image
  if (!image) return ""

  const url = image.type === "external" ? image.external?.url : image.file?.url
  if (!url) return ""

  const captionText = image.caption
    ?.map((item: any) => item.plain_text)
    .join("")
    .trim()
  const { width, caption } = parseImageCaption(captionText || "")
  const mappedUrl =
    image.type === "file" ? mapNotionImageUrl(url, block?.id) : url
  const safeUrl = escapeHtml(mappedUrl)
  const safeCaption = escapeHtml(caption)
  const safeAlt = safeCaption || ""
  const widthStyle = width ? ` style=\"--notion-image-width:${width};\"` : ""

  return `
<figure class=\"notion-image\"${widthStyle}>
  <img src=\"${safeUrl}\" alt=\"${safeAlt}\" />
  ${safeCaption ? `<figcaption>${safeCaption}</figcaption>` : ""}
</figure>
`.trim()
})

n2m.setCustomTransformer("callout", async (block: any) => {
  const icon = block?.callout?.icon
  let iconHtml = ""
  if (icon?.type === "emoji") {
    iconHtml = `<span class="notion-callout-icon">${escapeHtml(
      icon.emoji
    )}</span>`
  }

  const text = renderRichText(block?.callout?.rich_text)
  const children = block?.has_children
    ? await listAllBlockChildren(block.id)
    : []
  const childrenMarkdown = children.length
    ? await toMarkdownString(children)
    : ""

  const content = [
    `${iconHtml}${
      text ? ` <span class=\"notion-callout-text\">${text}</span>` : ""
    }`,
    childrenMarkdown,
  ]
    .filter(Boolean)
    .join("\n\n")

  return toBlockquote(content)
})

n2m.setCustomTransformer("column_list", async (block: any) => {
  const columns = (await listAllBlockChildren(block.id)).filter(
    (child) => child.type === "column"
  )

  if (!columns.length) return ""

  const columnHtml = await Promise.all(
    columns.map(async (column) => {
      const children = await listAllBlockChildren(column.id)
      const markdown = await toMarkdownString(children)
      return marked.parse(markdown)
    })
  )

  return `
<div class="notion-columns">
  ${columnHtml
    .map((html) => `<div class="notion-column">${html}</div>`)
    .join("")}
</div>
  `.trim()
})

n2m.setCustomTransformer("column", async (block: any) => {
  const children = await listAllBlockChildren(block.id)
  const markdown = await toMarkdownString(children)
  return markdown.trim()
})

n2m.setCustomTransformer("video", async (block: any) => {
  const video = block?.video
  if (!video) return ""

  const url = video.type === "external" ? video.external?.url : video.file?.url
  if (!url) return ""

  const captionText = video.caption
    ?.map((item: any) => item.plain_text)
    .join("")
    .trim()
  const safeCaption = captionText ? escapeHtml(captionText) : ""
  const figcaption = safeCaption ? `<figcaption>${safeCaption}</figcaption>` : ""

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  )
  if (youtubeMatch) {
    const videoId = youtubeMatch[1]
    return `<figure class="notion-video"><div class="notion-video-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>${figcaption}</figure>`
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    const videoId = vimeoMatch[1]
    return `<figure class="notion-video"><div class="notion-video-embed"><iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe></div>${figcaption}</figure>`
  }

  // 직접 업로드된 파일 (mp4, webm 등)
  // 서명 URL은 1시간 후 만료되므로, 재생 시 실시간으로 새 URL을 받아오는 API 라우트를 사용
  const videoSrc =
    video.type === "file"
      ? `/api/notion-video?blockId=${encodeURIComponent(block.id)}`
      : escapeHtml(url)
  return `<figure class="notion-video"><video controls preload="metadata"><source src="${videoSrc}" /></video>${figcaption}</figure>`
})

export const getPageContent = async (pageId: string): Promise<string> => {
  if (!pageId) return ""
  const mdBlocks = await n2m.pageToMarkdown(pageId)
  const markdown = n2m.toMarkdownString(mdBlocks)
  return markdown.parent || ""
}
