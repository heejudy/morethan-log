export const DEFAULT_CATEGORY = "📂 All" as string
export const HIDDEN_FEED_SLUGS = ["resume"] as const

export const isHiddenFeedSlug = (slug?: string) =>
  HIDDEN_FEED_SLUGS.includes((slug || "").toLowerCase() as typeof HIDDEN_FEED_SLUGS[number])
