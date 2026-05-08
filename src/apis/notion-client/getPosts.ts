import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { TPosts } from "src/types"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
export const getPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string
  if (!id) {
    throw new Error(
      "Missing NOTION_PAGE_ID. Add it to .env.local for local builds and to Vercel Environment Variables for deployment."
    )
  }

  const api = new NotionAPI()

  const response = await api.getPage(id).catch((error) => {
    throw new Error(
      `Could not load Notion page "${id}". Check that NOTION_PAGE_ID is copied from the public Notion web link and that the Notion page is published to the web. Original error: ${error.message}`
    )
  })
  id = idToUuid(id)
  const collectionValue = Object.values(response.collection)[0]?.value as any
  const collection = collectionValue?.value ?? collectionValue
  let block = response.block
  const schema = collection?.schema

  const blockValue = (block[id].value as any)?.value ?? block[id].value
  const rawMetadata = blockValue

  if (!Object.keys(response.collection_query || {}).length) {
    const collectionId =
      rawMetadata?.collection_id || rawMetadata?.format?.collection_pointer?.id
    const viewId = rawMetadata?.view_ids?.[0]
    const collectionViewValue = (response.collection_view?.[viewId]?.value as any)
      ?.value
      ? (response.collection_view?.[viewId]?.value as any).value
      : response.collection_view?.[viewId]?.value

    if (collectionId && viewId && collectionViewValue) {
      const collectionData = await api.getCollectionData(
        collectionId,
        viewId,
        collectionViewValue
      )

      response.block = {
        ...response.block,
        ...collectionData.recordMap.block,
      }
      response.collection = {
        ...response.collection,
        ...collectionData.recordMap.collection,
      }
      response.collection_view = {
        ...response.collection_view,
        ...collectionData.recordMap.collection_view,
      }
      response.collection_query = {
        ...response.collection_query,
        [collectionId]: {
          [viewId]: (collectionData.result as any)?.reducerResults,
        },
      }
      block = response.block
    }
  }

  // Check Type
  if (
    rawMetadata?.type !== "collection_view_page" &&
    rawMetadata?.type !== "collection_view"
  ) {
    return []
  } else if (!response.collection_query) {
    throw new Error(
      `Notion page "${CONFIG.notionConfig.pageId}" is accessible, but it does not expose a database collection. Use the shared web link of the duplicated morethan-log Notion database page, not a normal Notion document page.`
    )
  } else {
    // Construct Data
    const pageIds = getAllPageIds(response)
    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]
      const properties = (await getPageProperties(id, block, schema)) || null
      // Add fullwidth, createdtime to properties
      const pageBlockValue = (block[id].value as any)?.value ?? block[id].value
      properties.createdTime = new Date(
        pageBlockValue?.created_time
      ).toString()
      properties.fullWidth =
        (pageBlockValue?.format as any)?.page_full_width ?? false

      data.push(properties)
    }

    // Sort by date
    data.sort((a: any, b: any) => {
      const dateA: any = new Date(a?.date?.start_date || a.createdTime)
      const dateB: any = new Date(b?.date?.start_date || b.createdTime)
      return dateB - dateA
    })

    const posts = data as TPosts
    return posts
  }
}
