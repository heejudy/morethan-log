import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { FC, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css"

type Props = {
  content: string
}

const NotionRenderer: FC<Props> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const codeBlocks = containerRef.current.querySelectorAll("pre code")
    const raf = requestAnimationFrame(() => {
      codeBlocks.forEach((block) => {
        const element = block as HTMLElement
        if (!element.classList.contains("hljs")) {
          element.classList.add("hljs")
        }
        hljs.highlightElement(element)
      })
    })

    return () => cancelAnimationFrame(raf)
  }, [content])

  if (!content) return null

  return (
    <StyledWrapper ref={containerRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ className, children, ...props }) {
            const mergedClassName = [className, "hljs"]
              .filter(Boolean)
              .join(" ")
            return (
              <code className={mergedClassName} {...props}>
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
  line-height: 1.75;

  h1,
  h2,
  h3 {
    font-weight: 500;
    margin: 1.6rem 0 0.8rem;
  }

  p {
    margin: 0.75rem 0;
  }

  ul,
  ol {
    margin: 0.75rem 0 0.75rem 1.25rem;
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
    font-weight: 500;
    display: inline;
  }

  code {
    font-family: "Fira Code", monospace;
    background: rgba(148, 163, 184, 0.15);
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }

  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 12px;
    overflow-x: auto;
  }

  pre code {
    background: transparent;
    padding: 0;
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
    color: #3b82f6;
    text-decoration: underline;
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

  table th {
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
