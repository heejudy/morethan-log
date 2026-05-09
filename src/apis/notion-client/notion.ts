import { Client, PageObjectResponse } from "@notionhq/client"

export const notionClient = new Client({
  auth: process.env.NOTION_TOKEN,
})

type QueryDatabaseOptions = {
  filter?: unknown
  sorts?: unknown
}

const resolveDataSourceId = async (databaseId: string): Promise<string> => {
  try {
    const database = await (notionClient as any).databases.retrieve({
      database_id: databaseId,
    })
    const dataSource = database?.data_sources?.[0]
    return dataSource?.id || databaseId
  } catch {
    return databaseId
  }
}

export const getPages = async () => {
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) return { results: [] }

  const dataSourceId = await resolveDataSourceId(databaseId)

  return (notionClient as any).dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      property: "status",
      select: { equals: "Public" },
    },
  })
}

export const getDatabasePages = async (
  options: QueryDatabaseOptions = {}
): Promise<PageObjectResponse[]> => {
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) return []

  const dataSourceId = await resolveDataSourceId(databaseId)

  const results: PageObjectResponse[] = []
  let cursor: string | undefined

  do {
    const response = await (notionClient as any).dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
      ...(options.filter ? { filter: options.filter } : {}),
      ...(options.sorts ? { sorts: options.sorts } : {}),
    })

    results.push(
      ...(response.results.filter(
        (page: unknown): page is PageObjectResponse =>
          typeof page === "object" && page !== null && "properties" in page
      ) as PageObjectResponse[])
    )

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined
  } while (cursor)

  return results
}

export const getPageBySlug = async (slug: string) => {
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) return undefined

  const dataSourceId = await resolveDataSourceId(databaseId)

  return (notionClient as any).dataSources
    .query({
      data_source_id: dataSourceId,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
      page_size: 1,
    })
    .then(
      (res: { results: PageObjectResponse[] }) =>
        res.results[0] as PageObjectResponse | undefined
    )
}
