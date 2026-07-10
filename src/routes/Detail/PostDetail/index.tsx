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
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
  padding: 3rem 2rem 4rem;
  max-width: 56rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "#fff" : theme.colors.gray3};
  border-left: 1px solid ${({ theme }) => theme.colors.gray4};
  border-right: 1px solid ${({ theme }) => theme.colors.gray4};
  border-radius: 1rem;
  margin: 2rem auto;

  @media (min-width: 1180px) {
    &[data-has-toc="true"] {
      grid-template-columns: minmax(0, 46rem) 12rem;
      align-items: start;
      gap: 0.75rem;
      max-width: 58.75rem;
    }
  }

  @media (max-width: 640px) {
    padding: 2rem 1.25rem 3rem;
    border-radius: 0.75rem;
    margin: 1rem auto;
  }

  > article {
    margin: 0 auto;
    width: 100%;
    max-width: 46rem;

    @media (min-width: 1180px) {
      grid-column: 1;
      grid-row: 1;
    }
  }
`

const StyledToc = styled.aside`
  padding: 0.4rem 0 0.4rem 0.75rem;
  border-left: 1px solid ${({ theme }) => theme.colors.gray5};
  background: transparent;

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
    font-weight: 500;
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
    padding: 0.3rem 0.35rem;
    border-radius: 0.5rem;
    font-size: 0.82rem;
    line-height: 1.25rem;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.gray11};
    cursor: pointer;
    white-space: normal;
    word-break: keep-all;
    overflow-wrap: break-word;

    &[data-level="2"] {
      padding-left: 0.55rem;
    }

    &[data-level="3"] {
      padding-left: 0.85rem;
      font-size: 0.78rem;
    }

    &:hover {
      color: ${({ theme }) => theme.colors.gray12};
      background: ${({ theme }) => theme.colors.gray3};
    }
  }
`
