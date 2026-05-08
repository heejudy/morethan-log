export function getFirstPropertyValue<T extends string>(value?: T | T[]) {
  return Array.isArray(value) ? value[0] : value
}
