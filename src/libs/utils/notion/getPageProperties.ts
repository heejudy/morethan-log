import { getTextContent, getDateValue } from "notion-utils"
import { NotionAPI } from "notion-client"
import { BlockMap, CollectionPropertySchemaMap } from "notion-types"
import { customMapImageUrl } from "./customMapImageUrl"

const propertyNameMap: Record<string, string> = {
  Title: "title",
  Name: "title",
  Slug: "slug",
  Date: "date",
  Status: "status",
  Type: "type",
  Tags: "tags",
  Category: "category",
  Summary: "summary",
  Author: "author",
  Thumbnail: "thumbnail",
}

function normalizePropertyName(name: string) {
  return propertyNameMap[name] || name
}

async function getPageProperties(
  id: string,
  block: BlockMap,
  schema: CollectionPropertySchemaMap
) {
  const api = new NotionAPI()
  const blockEntry = block?.[id]?.value as any
  const blockValue = blockEntry?.value ?? blockEntry
  const rawProperties = Object.entries(blockValue?.properties || [])
  const excludeProperties = ["date", "select", "multi_select", "person", "file"]
  const properties: any = {}
  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val]: any = rawProperties[i]
    properties.id = id
    const propertyName = normalizePropertyName(schema[key]?.name || "")
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[propertyName] = getTextContent(val)
    } else {
      switch (schema[key]?.type) {
        case "file": {
          try {
            const Block = blockValue
            const url: string = val[0][1][0][1]
            const newurl = customMapImageUrl(url, Block)
            properties[propertyName] = newurl
          } catch (error) {
            properties[propertyName] = undefined
          }
          break
        }
        case "date": {
          const dateProperty: any = getDateValue(val)
          delete dateProperty.type
          properties[propertyName] = dateProperty
          break
        }
        case "select": {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[propertyName] = selects.split(",")
          }
          break
        }
        case "multi_select": {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[propertyName] = selects.split(",")
          }
          break
        }
        case "person": {
          const rawUsers = val.flat()

          const users = []
          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res: any = await api.getUsers(userId)
              const resValue =
                res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
              const user = {
                id: resValue?.id,
                name:
                  resValue?.name ||
                  `${resValue?.family_name}${resValue?.given_name}` ||
                  undefined,
                profile_photo: resValue?.profile_photo || null,
              }
              users.push(user)
            }
          }
          properties[propertyName] = users
          break
        }
        default:
          break
      }
    }
  }
  return properties
}

export { getPageProperties as default }
