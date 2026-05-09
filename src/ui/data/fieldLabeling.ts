export const FIELD_LABEL_VISIBILITY_VISIBLE = 'visible' as const
export const FIELD_LABEL_VISIBILITY_HIDDEN = 'hidden' as const

export type FieldLabelVisibility = typeof FIELD_LABEL_VISIBILITY_VISIBLE | typeof FIELD_LABEL_VISIBILITY_HIDDEN

export type FieldLabelingPolicy = {
  visibility: FieldLabelVisibility
  fallbackToPlaceholder: boolean
}

export const TABLE_FIELD_LABELING_POLICY_STANDARD: FieldLabelingPolicy = {
  visibility: FIELD_LABEL_VISIBILITY_VISIBLE,
  fallbackToPlaceholder: false,
}

type ResolveFieldLabelInput = {
  label?: string
  placeholder?: string
  policy?: FieldLabelingPolicy
}

export function resolveFieldLabel({ label, placeholder, policy }: ResolveFieldLabelInput): string | undefined {
  const activePolicy = policy ?? TABLE_FIELD_LABELING_POLICY_STANDARD

  if (activePolicy.visibility === FIELD_LABEL_VISIBILITY_HIDDEN) {
    return undefined
  }

  if (label) {
    return label
  }

  if (activePolicy.fallbackToPlaceholder) {
    return placeholder
  }

  return undefined
}
