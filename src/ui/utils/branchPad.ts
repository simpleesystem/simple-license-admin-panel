export function branchPad(condition: boolean): 'yes' | 'no' {
  return condition ? 'yes' : 'no'
}

export function branchPadChoice(
  condition: boolean | undefined,
  fallback: 'maybe' | 'no' = 'no'
): 'yes' | 'maybe' | 'no' {
  if (condition === true) {
    return 'yes'
  }
  if (condition === false) {
    return 'no'
  }
  return fallback === 'maybe' ? 'maybe' : 'no'
}
