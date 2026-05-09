import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import PostCard from "./PostCard"
import { DEFAULT_CATEGORY } from "../../../constants"
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
      let newFilteredPosts = data
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
  }, [q, currentTag, currentCategory, currentOrder, setFilteredPosts])

  return (
    <>
      <div className="my-2 ">
        {!filteredPosts.length && (
          <p className="text-gray-500 dark:text-gray-300">Nothing! 😺</p>
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
            {i !== filteredPosts.length - 1 && (
              <section className="section"></section>
            )}
          </StyledWrapper>
        ))}
      </div>
    </>
  )
}

export default PostList

const StyledWrapper = styled.div`
  &[data-rounded="top"] article {
    border-radius: 1rem 1rem 0 0;
  }

  &[data-rounded="bottom"] article {
    border-radius: 0 0 1rem 1rem;
  }

  &[data-rounded="top"] article:hover,
  &[data-rounded="bottom"] article:hover {
    border-radius: 1rem;
  }

  > .section {
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.gray6};
  }
`
