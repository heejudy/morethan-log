import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { FC, HTMLAttributes, ReactNode, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css"

type Props = {
  content: string
}

export type TocItem = {
  id: string
  text: string
  level: 1 | 2 | 3 | 4
}

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim()

const getNodeText = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("")
  }

  return ""
}

export const createHeadingId = (text: string) => {
  const normalized = stripHtml(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")

  return normalized || "section"
}

export const extractTableOfContents = (content: string): TocItem[] => {
  const headings = [...content.matchAll(/<h([1-4])[^>]*>(.*?)<\/h\1>/gis)]
  const counts = new Map<string, number>()

  return headings
    .map((match) => {
      const level = Number(match[1]) as TocItem["level"]
      const text = stripHtml(match[2])
      if (!text) return null

      const baseId = createHeadingId(text)
      const count = counts.get(baseId) || 0
      counts.set(baseId, count + 1)

      return {
        id: count ? `${baseId}-${count + 1}` : baseId,
        text,
        level,
      }
    })
    .filter((item): item is TocItem => Boolean(item))
}

const getNotionBlockHash = (href?: string) => {
  if (!href) return null
  const ids = href.replace(/-/g, "").match(/[0-9a-f]{32}/gi)
  const compactId = ids?.[ids.length - 1]
  if (!compactId) return null

  try {
    const parsed = new URL(href)
    const isNotionLink =
      parsed.hostname === "notion.so" || parsed.hostname.endsWith(".notion.so")
    return isNotionLink ? `#block-${compactId.toLowerCase()}` : null
  } catch {
    return href.startsWith("#") ? `#block-${compactId.toLowerCase()}` : null
  }
}

const NotionRenderer: FC<Props> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const headingCountsRef = useRef(new Map<string, number>())

  useEffect(() => {
    if (!containerRef.current) return
    const codeBlocks = containerRef.current.querySelectorAll("pre code")
    const raf = requestAnimationFrame(() => {
      codeBlocks.forEach((block) => {
        const element = block as HTMLElement
        if (element.dataset.highlighted === "yes") return
        hljs.highlightElement(element)
      })
    })

    return () => cancelAnimationFrame(raf)
  }, [content])

  if (!content) return null

  headingCountsRef.current = new Map()

  const renderHeading = (
    Tag: "h1" | "h2" | "h3" | "h4",
    children: ReactNode,
    props: HTMLAttributes<HTMLHeadingElement>
  ) => {
    const text = getNodeText(children)
    const baseId = createHeadingId(text)
    const count = headingCountsRef.current.get(baseId) || 0
    headingCountsRef.current.set(baseId, count + 1)
    const id = count ? `${baseId}-${count + 1}` : baseId

    return (
      <Tag {...props} id={id}>
        {children}
      </Tag>
    )
  }

  return (
    <StyledWrapper ref={containerRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1({ children, ...props }) {
            return renderHeading("h1", children, props)
          },
          h2({ children, ...props }) {
            return renderHeading("h2", children, props)
          },
          h3({ children, ...props }) {
            return renderHeading("h3", children, props)
          },
          h4({ children, ...props }) {
            return renderHeading("h4", children, props)
          },
          a({ href, children, ...props }) {
            const internalHash = getNotionBlockHash(href)
            const mappedHref = internalHash || href

            return (
              <a
                {...props}
                href={mappedHref}
                target={internalHash ? undefined : props.target}
                rel={internalHash ? undefined : props.rel}
                onClick={(event) => {
                  if (!internalHash) return

                  const target = document.getElementById(internalHash.slice(1))
                  if (!target) return

                  event.preventDefault()
                  if (target instanceof HTMLDetailsElement) {
                    target.open = true
                  }
                  target.scrollIntoView({ behavior: "smooth", block: "start" })
                  window.history.replaceState(null, "", internalHash)
                }}
              >
                {children}
              </a>
            )
          },
          code({ className, children, node: _node, ...props }) {
            const isCodeBlock = className?.includes("language-")
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </StyledWrapper>
  )
}

export default NotionRenderer

const StyledWrapper = styled.div`
  font-size: 1rem;
  line-height: 1.8;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray11};

  && h1,
  && h2,
  && h3,
  && h4 {
    scroll-margin-top: 5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray11};
    margin: 2rem 0 0.8rem;
  }

  h1 {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  h2 {
    font-size: 1.25rem;
    line-height: 1.85rem;
  }

  h3 {
    font-size: 1.1rem;
    line-height: 1.65rem;
  }

  h4 {
    font-size: 1rem;
    line-height: 1.55rem;
  }

  p {
    margin: 0.75rem 0;
    white-space: pre-wrap;
  }

  li,
  blockquote,
  .notion-toggle > summary {
    white-space: pre-wrap;
  }

  && strong,
  && b {
    font-weight: 500;
  }

  ul,
  ol {
    margin: 0.75rem 0 0.75rem 1.25rem;
  }

  .notion-indent {
    margin: 0.35rem 0 0.35rem 1.5rem;
  }

  li > .notion-indent {
    margin-top: 0.45rem;
    margin-left: 1rem;
  }

  .notion-indent > :first-child {
    margin-top: 0;
  }

  .notion-indent > :last-child {
    margin-bottom: 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 3px solid #e2e8f0;
    color: #64748b;
    margin: 1rem 0;
  }

  blockquote:has(.notion-callout-icon) {
    display: block;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(55, 53, 47, 0.16);
    background: ${({ theme }) =>
      theme.scheme === "light" ? "#f8fafc" : theme.colors.gray5};
    color: ${({ theme }) => theme.colors.gray12};
    border-left: none;
  }

  .notion-callout-icon {
    font-size: 1.05rem;
    line-height: 1.4;
    margin-right: 0.35rem;
  }

  .notion-callout-text {
    font-weight: 400;
    display: inline;
  }

  .notion-toggle {
    margin: 0.75rem 0;
    scroll-margin-top: 4rem;
    border: 1px solid
      ${({ theme }) =>
        theme.scheme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)"};
    border-radius: 0.85rem;
    background: ${({ theme }) =>
      theme.scheme === "light" ? "rgba(248, 250, 252, 0.78)" : "rgba(255, 255, 255, 0.04)"};
    overflow: hidden;
  }

  .notion-toggle > summary {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
    min-height: 1.65rem;
    padding: 0.7rem 0.85rem;
    border-radius: 0;
    cursor: pointer;
    list-style: none;
    font-weight: 500;
  }

  .notion-toggle-heading > summary {
    padding-top: 0.85rem;
    padding-bottom: 0.85rem;
    color: ${({ theme }) => theme.colors.gray11};
    font-weight: 500;
  }

  .notion-toggle-heading-1 > summary {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .notion-toggle-heading-2 > summary {
    font-size: 1.25rem;
    line-height: 1.85rem;
  }

  .notion-toggle-heading-3 > summary {
    font-size: 1.05rem;
    line-height: 1.65rem;
  }

  .notion-toggle > summary::-webkit-details-marker {
    display: none;
  }

  .notion-toggle > summary::before {
    content: "▶";
    flex: 0 0 auto;
    width: 1rem;
    color: ${({ theme }) => theme.colors.gray10};
    font-size: 0.65rem;
    line-height: 1.75rem;
    transform-origin: 45% 50%;
    transition: transform 120ms ease;
  }

  .notion-toggle[open] > summary::before {
    transform: rotate(90deg);
  }

  .notion-toggle > summary:hover {
    background: ${({ theme }) =>
      theme.scheme === "light" ? "rgba(236, 72, 153, 0.08)" : "rgba(34, 211, 238, 0.08)"};
  }

  .notion-toggle-content {
    margin-left: 0;
    padding: 0.1rem 1rem 0.85rem 2.2rem;
  }

  .notion-toggle-content > :first-child {
    margin-top: 0.25rem;
  }

  .notion-toggle-content > :last-child {
    margin-bottom: 0;
  }

  code {
    font-family: "Fira Code", monospace;
    background: ${({ theme }) => theme.colors.gray3};
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.red10};
  }

  pre {
    max-width: 100%;
    box-sizing: border-box;
    background: ${({ theme }) =>
      theme.scheme === "light" ? "#f6f6f4" : "#111827"};
    color: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray11 : "#e2e8f0"};
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  pre code {
    background: transparent;
    padding: 0;
    color: inherit;
    white-space: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    display: block;
    margin: 0.8rem auto;
  }

  .notion-image {
    margin: 1rem auto;
    text-align: center;
  }

  .notion-image img {
    width: var(--notion-image-width, auto);
    max-width: 100%;
    margin: 0 auto;
  }

  .notion-image figcaption {
    margin-top: 0.4rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray10};
  }

  a {
    color: ${({ theme }) => theme.colors.gray12};
    text-decoration: none;
    border-bottom: 1px solid
      ${({ theme }) =>
        theme.scheme === "light"
          ? "rgba(236, 72, 153, 0.38)"
          : "rgba(34, 211, 238, 0.48)"};
    background: ${({ theme }) =>
      theme.scheme === "light"
        ? "linear-gradient(transparent 62%, rgba(236, 72, 153, 0.14) 62%)"
        : "linear-gradient(transparent 62%, rgba(34, 211, 238, 0.14) 62%)"};
    border-radius: 0.2rem;
    padding: 0 0.06em;
    transition:
      background 120ms ease,
      border-color 120ms ease;
  }

  a:hover {
    border-bottom-color: ${({ theme }) =>
      theme.scheme === "light"
        ? "rgba(236, 72, 153, 0.72)"
        : "rgba(34, 211, 238, 0.76)"};
    background: ${({ theme }) =>
      theme.scheme === "light"
        ? "linear-gradient(transparent 45%, rgba(236, 72, 153, 0.22) 45%)"
        : "linear-gradient(transparent 45%, rgba(34, 211, 238, 0.22) 45%)"};
  }

  .notion-file {
    margin: 0.9rem 0;
  }

  .notion-file > a {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    gap: 0.45rem;
    padding: 0.45rem 0.65rem;
    border-radius: 0.55rem;
    background: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray3 : theme.colors.gray4};
    border-bottom: none;
    color: ${({ theme }) => theme.colors.gray11};
    text-decoration: none;
    vertical-align: top;
  }

  .notion-file > a:hover {
    background: ${({ theme }) =>
      theme.scheme === "light" ? theme.colors.gray4 : theme.colors.gray5};
  }

  .notion-file-label {
    flex: 0 0 auto;
    padding: 0.1rem 0.35rem;
    border-radius: 0.4rem;
    background: ${({ theme }) =>
      theme.scheme === "light" ? "#fee2e2" : "rgba(248, 113, 113, 0.18)"};
    color: ${({ theme }) =>
      theme.scheme === "light" ? "#b91c1c" : "#fca5a5"};
    font-size: 0.75rem;
    line-height: 1.1rem;
    font-weight: 600;
  }

  .notion-file-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin: 1.2rem 0;
    border: 1px solid rgba(55, 53, 47, 0.12);
    border-radius: 10px;
    overflow: hidden;
    background: ${({ theme }) =>
      theme.scheme === "light" ? "#fff" : theme.colors.gray5};
  }

  table th,
  table td {
    border-right: 1px solid rgba(55, 53, 47, 0.12);
    border-bottom: 1px solid rgba(55, 53, 47, 0.12);
    padding: 0.75rem 0.85rem;
    vertical-align: top;
    text-align: left;
  }

  table thead {
    display: table-header-group;
    background: ${({ theme }) =>
      theme.scheme === "light" ? "#f7f7f5" : theme.colors.gray4};
  }

  && table th {
    font-weight: 500;
  }

  table tr:last-child td {
    border-bottom: none;
  }

  table th:last-child,
  table td:last-child {
    border-right: none;
  }

  table p {
    margin: 0.35rem 0;
  }

  .notion-columns {
    display: flex;
    gap: 2rem;
    margin: 1.2rem 0;
  }

  .notion-column {
    flex: 1;
    min-width: 0;
  }

  .notion-column > :first-child {
    margin-top: 0;
  }

  .notion-column > :last-child {
    margin-bottom: 0;
  }

  .notion-bookmark {
    border: 1px solid rgba(55, 53, 47, 0.16);
    border-radius: 14px;
    overflow: hidden;
    margin: 1rem 0;
    background: ${({ theme }) =>
      theme.scheme === "light" ? "#fff" : theme.colors.gray4};
  }

  .notion-bookmark > a {
    display: flex;
    gap: 1rem;
    padding: 0;
    border-bottom: none;
    border-radius: 0;
    background: none;
    text-decoration: none;
    color: inherit;
  }

  .notion-bookmark-content {
    flex: 1;
    padding: 1rem 1.25rem;
    min-width: 0;
  }

  .notion-bookmark-title {
    font-weight: 500;
    font-size: 1rem;
    margin-bottom: 0.35rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notion-bookmark-desc {
    font-size: 0.92rem;
    color: ${({ theme }) => theme.colors.gray10};
    line-height: 1.4;
    max-height: 2.8em;
    overflow: hidden;
  }

  .notion-bookmark-url {
    margin-top: 0.6rem;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.gray10};
  }

  .notion-bookmark-thumb {
    width: 160px;
    flex-shrink: 0;
  }

  .notion-bookmark-thumb img {
    max-width: 100%;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0;
    display: block;
  }

  .notion-video {
    margin: 1rem auto;
    text-align: center;
  }

  .notion-video-embed {
    position: relative;
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
  }

  .notion-video-embed iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .notion-video video {
    width: 100%;
    max-width: 50%;
    border-radius: 12px;
    display: block;
  }

  .notion-video figcaption {
    margin-top: 0.4rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.gray10};
  }

  .notion-color-gray {
    color: #858585;
  }
  .notion-color-brown {
    color: #9e7740;
  }
  .notion-color-orange {
    color: #ff842d;
  }
  .notion-color-yellow {
    color: #ca8a04;
  }
  .notion-color-green {
    color: #48ba72;
  }
  .notion-color-blue {
    color: #3f8cdf;
  }
  .notion-color-purple {
    color: #a646cc;
  }
  .notion-color-pink {
    color: #ff509e;
  }
  .notion-color-red {
    color: #dc2626;
  }

  .notion-color-gray_background {
    background: rgba(133, 133, 133, 0.18);
    color: #858585;
  }
  .notion-color-brown_background {
    background: rgba(158, 119, 64, 0.18);
    color: #9e7740;
  }
  .notion-color-orange_background {
    background: rgba(255, 132, 45, 0.18);
    color: #ff842d;
  }
  .notion-color-yellow_background {
    background: rgba(239, 194, 0, 0.2);
    color: #eec200;
  }
  .notion-color-green_background {
    background: rgba(22, 163, 74, 0.18);
    color: #48ba72;
  }
  .notion-color-blue_background {
    background: rgba(63, 140, 223, 0.18);
    color: #3f8cdf;
  }
  .notion-color-purple_background {
    background: rgba(166, 70, 204, 0.18);
    color: #a646cc;
  }
  .notion-color-pink_background {
    background: rgba(255, 80, 158, 0.18);
    color: #ff509e;
  }
  .notion-color-red_background {
    background: rgba(221, 33, 33, 0.18);
    color: #dd2121;
  }
`
