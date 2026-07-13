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
        const internalHref = mapInternalNotionHref(item.href)
        const href = internalHref || item.href
        const externalAttrs = internalHref
          ? ""
          : ` target="_blank" rel="noopener noreferrer"`
        return `<a href="${escapeHtml(href)}"${externalAttrs}>${text}</a>`
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

const normalizeImageUrl = (value?: string | null) => {
  if (!value) return ""

  try {
    const parsed = new URL(value)
    const pathname = decodeURIComponent(parsed.pathname)

    if (
      (parsed.hostname === "www.notion.so" || parsed.hostname === "notion.so") &&
      pathname.startsWith("/image/")
    ) {
      return pathname.replace(/^\/image\//, "")
    }

    return `${parsed.origin}${pathname}`
  } catch {
    return value.split("?")[0] || value
  }
}

const isSameImageUrl = (a?: string | null, b?: string | null) => {
  const left = normalizeImageUrl(a)
  const right = normalizeImageUrl(b)
  return Boolean(left && right && left === right)
}

const getNotionBlockAnchor = (value?: string) => {
  if (!value) return null
  const ids = value.replace(/-/g, "").match(/[0-9a-f]{32}/gi)
  const compactId = ids?.[ids.length - 1]
  return compactId ? `block-${compactId.toLowerCase()}` : null
}

const mapInternalNotionHref = (href?: string) => {
  if (!href) return null

  const anchor = getNotionBlockAnchor(href)
  if (!anchor) return null

  try {
    const parsed = new URL(href)
    const isNotionLink =
      parsed.hostname === "notion.so" || parsed.hostname.endsWith(".notion.so")
    return isNotionLink ? `#${anchor}` : null
  } catch {
    return href.startsWith("#") ? `#${anchor}` : null
  }
}

const renderCodeBlockHtml = (block: any) => {
  const language = block?.code?.language || "plaintext"
  const text = block?.code?.rich_text
    ?.map((item: any) => item.plain_text || "")
    .join("")
    .replace(/^```[a-z0-9_-]*\n?/i, "")
    .replace(/\n?```$/i, "")

  return `<pre><code class="language-${escapeHtml(language)}">${escapeHtml(
    text || ""
  )}</code></pre>`
}

type RenderOptions = {
  excludedImageUrl?: string | null
}

const renderBlocksHtml = async (blocks: any[], options: RenderOptions = {}) => {
  const htmlBlocks = await Promise.all(
    blocks.map((block) => renderBlockHtml(block, options))
  )
  return htmlBlocks.filter(Boolean).join("")
}

const renderToggleHtml = async (
  block: any,
  text: string,
  className = "",
  options: RenderOptions = {}
) => {
  const anchor = getNotionBlockAnchor(block?.id)
  const children = block?.has_children ? await listAllBlockChildren(block.id) : []
  const childrenHtml = children.length
    ? await renderBlocksHtml(children, options)
    : ""
  const classes = ["notion-toggle", className].filter(Boolean).join(" ")

  return `<details class="${classes}"${
    anchor ? ` id="${anchor}"` : ""
  }><summary>${text || "&nbsp;"}</summary><div class="notion-toggle-content">${childrenHtml}</div></details>`
}

const renderBlockHtml = async (
  block: any,
  options: RenderOptions = {}
): Promise<string> => {
  const type = block?.type
  const value = block?.[type]

  if (!type || !value) return ""

  if (type === "paragraph") {
    const text = renderRichText(value.rich_text)
    return text ? `<p>${text}</p>` : ""
  }

  if (type === "code") {
    return renderCodeBlockHtml(block)
  }

  if (type === "bulleted_list_item") {
    return `<ul><li>${renderRichText(value.rich_text)}</li></ul>`
  }

  if (type === "numbered_list_item") {
    return `<ol><li>${renderRichText(value.rich_text)}</li></ol>`
  }

  if (type === "heading_1") {
    if (value.is_toggleable) {
      return renderToggleHtml(
        block,
        renderRichText(value.rich_text),
        "notion-toggle-heading notion-toggle-heading-1",
        options
      )
    }
    return `<h1>${renderRichText(value.rich_text)}</h1>`
  }

  if (type === "heading_2") {
    if (value.is_toggleable) {
      return renderToggleHtml(
        block,
        renderRichText(value.rich_text),
        "notion-toggle-heading notion-toggle-heading-2",
        options
      )
    }
    return `<h2>${renderRichText(value.rich_text)}</h2>`
  }

  if (type === "heading_3") {
    if (value.is_toggleable) {
      return renderToggleHtml(
        block,
        renderRichText(value.rich_text),
        "notion-toggle-heading notion-toggle-heading-3",
        options
      )
    }
    return `<h3>${renderRichText(value.rich_text)}</h3>`
  }

  if (type === "quote") {
    return `<blockquote>${renderRichText(value.rich_text)}</blockquote>`
  }

  if (type === "divider") {
    return "<hr />"
  }

  if (type === "toggle") {
    const text = renderRichText(value.rich_text)
    return renderToggleHtml(block, text, "", options)
  }

  if (type === "image") {
    return renderImageBlockHtml(block, options)
  }

  if (type === "callout") {
    return renderCalloutBlockHtml(block, options)
  }

  if (type === "column_list") {
    return renderColumnListBlockHtml(block, options)
  }

  if (type === "column") {
    const children = await listAllBlockChildren(block.id)
    return renderBlocksHtml(children, options)
  }

  const markdown = await toMarkdownString([block])
  return markdown ? String(marked.parse(markdown)) : ""
}

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

    if (isNotionS3 && parsed.searchParams.has("X-Amz-Signature")) {
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

const renderImageBlockHtml = async (
  block: any,
  options: RenderOptions = {}
) => {
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

  if (isSameImageUrl(mappedUrl, options.excludedImageUrl)) {
    return ""
  }

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
}

n2m.setCustomTransformer("image", renderImageBlockHtml)

n2m.setCustomTransformer("toggle", async (block: any) => {
  const text = renderRichText(block?.toggle?.rich_text)
  return renderToggleHtml(block, text)
})

const setToggleableHeadingTransformer = (
  type: "heading_1" | "heading_2" | "heading_3",
  tag: "h1" | "h2" | "h3"
) => {
  n2m.setCustomTransformer(type, async (block: any) => {
    const value = block?.[type]
    const text = renderRichText(value?.rich_text)

    if (value?.is_toggleable) {
      return renderToggleHtml(
        block,
        text,
        `notion-toggle-heading notion-toggle-heading-${tag.slice(1)}`
      )
    }

    return `<${tag}>${text}</${tag}>`
  })
}

setToggleableHeadingTransformer("heading_1", "h1")
setToggleableHeadingTransformer("heading_2", "h2")
setToggleableHeadingTransformer("heading_3", "h3")

const renderCalloutBlockHtml = async (
  block: any,
  options: RenderOptions = {}
) => {
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
    ? await renderBlocksHtml(children, options)
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
}

const renderColumnListBlockHtml = async (
  block: any,
  options: RenderOptions = {}
) => {
  const columns = (await listAllBlockChildren(block.id)).filter(
    (child) => child.type === "column"
  )

  if (!columns.length) return ""

  const columnHtml = await Promise.all(
    columns.map(async (column) => {
      const children = await listAllBlockChildren(column.id)
      return renderBlocksHtml(children, options)
    })
  )

  return `
<div class="notion-columns">
  ${columnHtml
    .map((html) => `<div class="notion-column">${html}</div>`)
    .join("")}
</div>
  `.trim()
}

n2m.setCustomTransformer("callout", renderCalloutBlockHtml)
n2m.setCustomTransformer("column_list", renderColumnListBlockHtml)

n2m.setCustomTransformer("column", async (block: any) => {
  const children = await listAllBlockChildren(block.id)
  return renderBlocksHtml(children)
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
  const figcaption = safeCaption
    ? `<figcaption>${safeCaption}</figcaption>`
    : ""

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

export const getPageContent = async (
  pageId: string,
  excludedImageUrl?: string | null
): Promise<string> => {
  if (!pageId) return ""
  const blocks = await listAllBlockChildren(pageId)
  return renderBlocksHtml(blocks, { excludedImageUrl })
}
