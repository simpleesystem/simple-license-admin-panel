const CAMELIZE_SEPARATOR_PATTERN = /[_-](\w)/g

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isDate = (value: unknown): value is Date => value instanceof Date

const camelizeString = (value: string): string =>
  value.replace(CAMELIZE_SEPARATOR_PATTERN, (_match, group: string) => group.toUpperCase())

export const camelizeKeysDeep = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => camelizeKeysDeep(item)) as unknown as T
  }

  if (isDate(value)) {
    return value
  }

  if (isObject(value)) {
    const entries = Object.entries(value).map(([key, val]) => [camelizeString(key), camelizeKeysDeep(val)])
    return Object.fromEntries(entries) as T
  }

  return value
}
