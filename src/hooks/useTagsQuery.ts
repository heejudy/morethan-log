import usePostsQuery from "./usePostsQuery"
import { getAllSelectItemsFromPosts } from "../libs/utils/notion"
import { isHiddenFeedSlug } from "../constants"

export const useTagsQuery = () => {
  const posts = usePostsQuery()
  const tags = getAllSelectItemsFromPosts(
    "tags",
    posts.filter(
      (post) => !isHiddenFeedSlug(post.slug) && post.status?.[0] === "Public"
    )
  )

  return tags
}
