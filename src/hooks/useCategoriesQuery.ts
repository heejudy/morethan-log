import { DEFAULT_CATEGORY } from "../constants"
import usePostsQuery from "./usePostsQuery"
import { getAllSelectItemsFromPosts } from "../libs/utils/notion"
import { isHiddenFeedSlug } from "../constants"

export const useCategoriesQuery = () => {
  const posts = usePostsQuery()
  const feedPosts = posts.filter(
    (post) => !isHiddenFeedSlug(post.slug) && post.status?.[0] === "Public"
  )
  const categories = getAllSelectItemsFromPosts("category", feedPosts)

  return {
    [DEFAULT_CATEGORY]: feedPosts.length,
    ...categories,
  }
}
