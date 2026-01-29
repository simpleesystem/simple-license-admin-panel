export const composeClassNames = (...classes: Array<string | false | null | undefined>): string => {
  const seen = new Set<string>()
  const tokens: string[] = []

  for (const entry of classes) {
    if (!entry) {
      continue
    }
    const normalized = entry.trim()
    if (!normalized) {
      continue
    }
    const tokenList = normalized.split(/\s+/u).filter(Boolean)
    for (const token of tokenList) {
      if (seen.has(token)) {
        continue
      }
      seen.add(token)
      tokens.push(token)
    }
  }

  return tokens.join(' ')
}
