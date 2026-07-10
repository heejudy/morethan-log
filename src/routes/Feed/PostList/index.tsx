import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import PostCard from "./PostCard"
import { DEFAULT_CATEGORY, isHiddenFeedSlug } from "../../../constants"
import usePostsQuery from "../../../hooks/usePostsQuery"
import styled from "@emotion/styled"

type Props = {
  q: string
}

const PostList: React.FC<Props> = ({ q }) => {
  const router = useRouter()
  const data = usePostsQuery()
  const [filteredPosts, setFilteredPosts] = useState(data)

  const currentTag = `${router.query.tag || ``}` || undefined
  const currentCategory = `${router.query.category || ``}` || DEFAULT_CATEGORY
  const currentOrder = `${router.query.order || ``}` || "desc"

  useEffect(() => {
    setFilteredPosts(() => {
      let newFilteredPosts = data.filter((post) => !isHiddenFeedSlug(post.slug))
      // keyword
      newFilteredPosts = newFilteredPosts.filter((post) => {
        const tagContent = post.tags ? post.tags.join(" ") : ""
        const searchContent = post.title + post.summary + tagContent
        return searchContent.toLowerCase().includes(q.toLowerCase())
      })

      // tag
      if (currentTag) {
        newFilteredPosts = newFilteredPosts.filter(
          (post) => post && post.tags && post.tags.includes(currentTag)
        )
      }

      // category
      if (currentCategory !== DEFAULT_CATEGORY) {
        newFilteredPosts = newFilteredPosts.filter(
          (post) =>
            post && post.category && post.category.includes(currentCategory)
        )
      }
      // order
      if (currentOrder !== "desc") {
        newFilteredPosts = newFilteredPosts.reverse()
      }

      return newFilteredPosts
    })
  }, [data, q, currentTag, currentCategory, currentOrder, setFilteredPosts])

  return (
    <>
      <StyledList className="my-2">
        {!filteredPosts.length && (
          <p className="empty">Nothing! 😺</p>
        )}
        {filteredPosts.map((post, i) => (
          <StyledWrapper
            key={post.id}
            data-rounded={
              i === 0
                ? "top"
                : i === filteredPosts.length - 1
                ? "bottom"
                : "none"
            }
          >
            <PostCard data={post} />
          </StyledWrapper>
        ))}
      </StyledList>
    </>
  )
}

export default PostList

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .empty {
    margin: 0;
    padding: 1.25rem;
    border-radius: 1rem;
    color: ${({ theme }) => theme.colors.gray10};
    background-color: ${({ theme }) =>
      theme.scheme === "light" ? "rgba(255, 255, 255, 0.82)" : theme.colors.gray4};
  }
`

const StyledWrapper = styled.div`
  &[data-rounded="top"] article {
    border-radius: 1rem;
  }

  &[data-rounded="bottom"] article {
    border-radius: 1rem;
  }

  &[data-rounded="top"] article:hover,
  &[data-rounded="bottom"] article:hover {
    border-radius: 1rem;
  }
`
