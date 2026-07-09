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

  return (
    <StyledWrapper>
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
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-top: 3rem;
  padding-bottom: 3rem;
  border-radius: 1.5rem;
  max-width: 76rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "rgba(255, 255, 255, 0.88)" : "rgba(33, 33, 39, 0.9)"};
  border: 1px solid
    ${({ theme }) =>
      theme.scheme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)"};
  box-shadow: ${({ theme }) =>
    theme.scheme === "light"
      ? "0 20px 54px rgba(37, 24, 16, 0.08)"
      : "0 20px 54px rgba(0, 0, 0, 0.28)"};
  margin: 0 auto;

  @media (min-width: 1180px) {
    grid-template-columns: minmax(0, 42rem) 14rem;
    align-items: start;
  }

  @media (max-width: 640px) {
    padding: 1.25rem;
    border-radius: 1.25rem;
  }

  > article {
    margin: 0 auto;
    width: 100%;
    max-width: 42rem;

    @media (min-width: 1180px) {
      grid-column: 1;
      grid-row: 1;
    }
  }
`

const StyledToc = styled.aside`
  padding: 1rem;
  border-radius: 1rem;
  background: ${({ theme }) =>
    theme.scheme === "light" ? "rgba(255, 250, 245, 0.74)" : "rgba(255, 255, 255, 0.04)"};
  border: 1px solid
    ${({ theme }) =>
      theme.scheme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)"};

  @media (min-width: 1180px) {
    position: sticky;
    top: 5rem;
    grid-column: 2;
    grid-row: 1;
  }

  .toc-title {
    margin-bottom: 0.75rem;
    font-size: 0.78rem;
    line-height: 1rem;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.gray11};
    text-transform: uppercase;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  a {
    display: block;
    padding: 0.35rem 0.45rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.35rem;
    color: ${({ theme }) => theme.colors.gray11};
    cursor: pointer;

    &[data-level="2"] {
      padding-left: 1rem;
    }

    &[data-level="3"] {
      padding-left: 1.5rem;
      font-size: 0.82rem;
    }

    &:hover {
      color: ${({ theme }) => theme.colors.gray12};
      background: ${({ theme }) =>
        theme.scheme === "light" ? "rgba(236, 72, 153, 0.08)" : "rgba(34, 211, 238, 0.08)"};
    }
  }
`
