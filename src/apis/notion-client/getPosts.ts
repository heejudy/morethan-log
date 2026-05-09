import { PageObjectResponse } from "@notionhq/client"
import { getDatabasePages } from "./notion"
import { mapNotionImageUrl } from "./getRecordMap"
import { TPost, TPosts, TPostStatus, TPostType } from "../../types"
const POST_TYPES: TPostType[] = ["Post", "Paper", "Page"]
const POST_STATUSES: TPostStatus[] = ["Private", "Public", "PublicOnDetail"]

const toPostTypes = (values?: string[]): TPostType[] => {
  const filtered = (values || []).filter((value): value is TPostType =>
    POST_TYPES.includes(value as TPostType)
  )
  return filtered.length ? filtered : ["Post"]
}

const toPostStatuses = (values?: string[]): TPostStatus[] => {
  const filtered = (values || []).filter((value): value is TPostStatus =>
    POST_STATUSES.includes(value as TPostStatus)
  )
  return filtered.length ? filtered : ["Private"]
}

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

const getPropertyByNames = (
  page: PageObjectResponse,
  names: string[]
): PageObjectResponse["properties"][string] | undefined => {
  return names.map((name) => page.properties[name]).find(Boolean)
}

const getPlainText = (page: PageObjectResponse, names: string[]): string => {
  const prop = getPropertyByNames(page, names)
  if (!prop) return ""
  if (prop.type === "title") {
    return prop.title.map((t) => t.plain_text).join("")
  }
  if (prop.type === "rich_text") {
    return prop.rich_text.map((t) => t.plain_text).join("")
  }
  return ""
}

const getSelect = (
  page: PageObjectResponse,
  names: string[]
): string | undefined => {
  const prop = getPropertyByNames(page, names)
  if (!prop) return undefined
  if (prop.type === "select") return prop.select?.name
  if (prop.type === "status") return prop.status?.name
  return undefined
}

const getMultiSelect = (
  page: PageObjectResponse,
  names: string[]
): string[] | undefined => {
  const prop = getPropertyByNames(page, names)
  if (!prop) return undefined
  if (prop.type === "multi_select") {
    return prop.multi_select.map((item) => item.name)
  }
  if (prop.type === "select") {
    return prop.select?.name ? [prop.select.name] : undefined
  }
  if (prop.type === "status") {
    return prop.status?.name ? [prop.status.name] : undefined
  }
  return undefined
}

const getDate = (
  page: PageObjectResponse,
  names: string[]
): { start_date: string } | undefined => {
  const prop = getPropertyByNames(page, names)
  if (!prop || prop.type !== "date") return undefined
  const start = prop.date?.start
  return start ? { start_date: start } : undefined
}

const getPeople = (
  page: PageObjectResponse,
  names: string[]
): TPost["author"] | undefined => {
  const prop = getPropertyByNames(page, names)
  if (!prop || prop.type !== "people") return undefined
  return prop.people.map((person) => ({
    id: person.id,
    name: "name" in person ? person.name || "" : "",
    profile_photo: "avatar_url" in person ? person.avatar_url || null : null,
  }))
}

const getCheckbox = (page: PageObjectResponse, names: string[]): boolean => {
  const prop = getPropertyByNames(page, names)
  if (!prop || prop.type !== "checkbox") return false
  return prop.checkbox
}

const getFiles = (
  page: PageObjectResponse,
  names: string[]
): string | undefined => {
  const prop = getPropertyByNames(page, names)
  if (prop?.type !== "files" || !prop.files.length) return undefined
  const file = prop.files[0]
  if (file.type === "external") return file.external.url
  return mapNotionImageUrl(file.file.url, page.id)
}

const getCover = (page: PageObjectResponse): string | undefined => {
  if (!page.cover) return undefined
  if (page.cover.type === "external") return page.cover.external.url
  return mapNotionImageUrl(page.cover.file.url, page.id)
}

const mapPageToPost = (page: PageObjectResponse): TPost => {
  const title = getPlainText(page, ["Title", "Name", "title"])
  const slug = getPlainText(page, ["Slug", "slug"])
  const summary = getPlainText(page, ["Summary", "summary", "Description"])
  const date = getDate(page, ["Date", "date"])
  const type = toPostTypes(getMultiSelect(page, ["Type", "type"]))
  const status = toPostStatuses(getMultiSelect(page, ["Status", "status"]))
  const tags = getMultiSelect(page, ["Tags", "tags"])
  const category = getMultiSelect(page, ["Category", "category"])
  const author = getPeople(page, ["Author", "author"])
  const thumbnail =
    getFiles(page, ["Thumbnail", "thumbnail", "Cover", "cover"]) ||
    getCover(page)
  const fullWidth = getCheckbox(page, ["FullWidth", "fullWidth", "Full Width"])

  return {
    id: page.id,
    date: date || { start_date: page.created_time },
    type,
    slug,
    tags,
    category,
    summary: summary || null,
    author,
    title,
    status,
    createdTime: new Date(page.created_time).toString(),
    fullWidth,
    thumbnail: thumbnail ?? null,
  }
}

export const getPosts = async (): Promise<TPosts> => {
  const pages = await getDatabasePages()
  const data = pages.map(mapPageToPost)

  data.sort((a, b) => {
    const dateA = new Date(a?.date?.start_date || a.createdTime)
    const dateB = new Date(b?.date?.start_date || b.createdTime)
    return dateB.getTime() - dateA.getTime()
  })

  return data
}
