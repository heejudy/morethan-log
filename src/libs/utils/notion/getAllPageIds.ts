import { idToUuid } from "notion-utils"
import { ExtendedRecordMap, ID } from "notion-types"

function collectBlockIds(value: any, pageSet: Set<ID>) {
  if (!value || typeof value !== "object") return

  if (Array.isArray(value.blockIds)) {
    value.blockIds.forEach((id: ID) => pageSet.add(id))
  }

  Object.values(value).forEach((child) => collectBlockIds(child, pageSet))
}

export default function getAllPageIds(
  response: ExtendedRecordMap,
  viewId?: string
) {
  const collectionQuery = response.collection_query
  if (!collectionQuery) return []

  const views = Object.values(collectionQuery)[0]
  if (!views) return []

  let pageIds: ID[] = []
  if (viewId) {
    const vId = idToUuid(viewId)
    const pageSet = new Set<ID>()
    collectBlockIds(views[vId], pageSet)
    pageIds = [...pageSet]
  } else {
    const pageSet = new Set<ID>()
    collectBlockIds(views, pageSet)
    pageIds = [...pageSet]
  }
  return pageIds
}
