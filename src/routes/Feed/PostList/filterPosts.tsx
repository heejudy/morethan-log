import { DEFAULT_CATEGORY } from "src/constants"
import { TPost } from "src/types"

interface FilterPostsParams {
  posts: TPost[]
  q: string
  tag?: string
  category?: string
  order?: string
}

export function filterPosts({
  posts,
  q,
  tag,
  category = DEFAULT_CATEGORY,
  order = "desc",
}: FilterPostsParams): TPost[] {
  return (posts || [])
    .filter((post) => {
      // 안전한 기본값 처리
      const title = post.title || ""
      const summary = post.summary || ""
      const tagContent = post.tags ? post.tags.join(" ") : ""

      const searchContent = (title + summary + tagContent).toLowerCase()

      return (
        searchContent.includes((q || "").toLowerCase()) &&
        (!tag || post.tags?.includes(tag)) &&
        (
          category === DEFAULT_CATEGORY ||
          post.category?.includes(category)
        )
      )
    })
    .sort((a, b) => {
      // date 안전 처리 (없으면 0으로)
      const dateA = a.date?.start_date
        ? new Date(a.date.start_date).getTime()
        : 0

      const dateB = b.date?.start_date
        ? new Date(b.date.start_date).getTime()
        : 0

      return order === "desc"
        ? dateB - dateA
        : dateA - dateB
    })
}