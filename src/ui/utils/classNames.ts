export const composeClassNames = (...classes: Array<string | false | null | undefined>): string => {
  const seen = new Set<string>()
  const tokens: string[] = []

  classes.forEach((entry) => {
    if (!entry) {
      return
    }
    const normalized = entry.trim()
    if (!normalized) {
      return
    }
    normalized
      .split(/\s+/u)
      .filter(Boolean)
      .forEach((token) => {
        if (seen.has(token)) {
          return
        }
        seen.add(token)
        tokens.push(token)
      })
  })

  return tokens.join(' ')
}
