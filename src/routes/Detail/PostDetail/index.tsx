import React, { useMemo } from "react"
import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./CommentBox"
import Category from "../../../components/Category"
import styled from "@emotion/styled"
import NotionRenderer, {
  TocItem,
  extractTableOfContents,
} from "../components/NotionRenderer"
import usePostQuery from "../../../hooks/usePostQuery"

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery()
  const content = data?.content || ""
  const tableOfContents = useMemo(
    () => extractTableOfContents(content),
    [content]
  )

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined

  const hasTableOfContents = tableOfContents.length >= 2

  return (
    <StyledWrapper data-has-toc={hasTableOfContents}>
      <TableOfContents items={tableOfContents} />
      <article>
        {category && (
          <div css={{ marginBottom: "0.5rem" }}>
            <Category readOnly={data.status?.[0] === "PublicOnDetail"}>
              {category}
            </Category>
          </div>
        )}
        {data.type[0] === "Post" && <PostHeader data={data} />}
        <div>
          <NotionRenderer content={data.content} />
        </div>
        {data.type[0] === "Post" && (
          <>
            <Footer />
            <CommentBox data={data} />
          </>
        )}
      </article>
    </StyledWrapper>
  )
}

export default PostDetail

const TableOfContents = ({ items }: { items: TocItem[] }) => {
  if (items.length < 2) return null

  return (
    <StyledToc>
      <div className="toc-title">Contents</div>
      <nav>
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} data-level={item.level}>
            {item.text}
          </a>
        ))}
      </nav>
    </StyledToc>
  )
}

const StyledWrapper = styled.div`
  position: relative;
  padding: 2.5rem 0 4rem;
  max-width: 58rem;
  margin: 0 auto;

  @media (max-width: 640px) {
    padding: 1.25rem 0 3rem;
  }

  > article {
    margin: 0 auto;
    width: 100%;
    max-width: 58rem;
    padding: 3.25rem 4.5rem 4rem;
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? "#fff" : theme.colors.gray3};
    border: 1px solid
      ${({ theme }) =>
        theme.scheme === "light" ? "rgba(15, 23, 42, 0.06)" : "rgba(255, 255, 255, 0.08)"};
    border-radius: 1.1rem;
    box-shadow: ${({ theme }) =>
      theme.scheme === "light"
        ? "0 14px 32px rgba(15, 23, 42, 0.04)"
        : "0 14px 32px rgba(0, 0, 0, 0.18)"};

    @media (max-width: 768px) {
      padding: 2.25rem 1.5rem 3rem;
      border-radius: 0.9rem;
    }
  }
`

const StyledToc = styled.aside`
  display: none;
  padding: 0.35rem 0 0.35rem 0.15rem;
  background: transparent;

  @media (min-width: 1180px) {
    display: block;
    position: absolute;
    top: 2.85rem;
    left: calc(100% + 2.75rem);
    width: 13.5rem;
  }

  .toc-title {
    margin-bottom: 0.65rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid
      ${({ theme }) =>
        theme.scheme === "light" ? "rgba(15, 23, 42, 0.1)" : "rgba(255, 255, 255, 0.12)"};
    font-size: 0.86rem;
    line-height: 1.25rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray11};
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
  }

  a {
    display: block;
    width: fit-content;
    max-width: 100%;
    padding: 0.2rem 0;
    border-bottom: 1px solid
      ${({ theme }) =>
        theme.scheme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.1)"};
    border-radius: 0;
    font-size: 0.8rem;
    line-height: 1.45rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.gray11};
    cursor: pointer;
    white-space: normal;
    word-break: keep-all;
    overflow-wrap: break-word;

    &[data-level="1"] {
      padding-left: 0;
      font-weight: 500;
    }

    &[data-level="2"] {
      margin-left: 1rem;
    }

    &[data-level="3"] {
      margin-left: 1.6rem;
      font-size: 0.78rem;
    }

    &[data-level="4"] {
      margin-left: 2.2rem;
      font-size: 0.76rem;
    }

    &:hover {
      color: ${({ theme }) => theme.colors.gray12};
    }
  }
`
