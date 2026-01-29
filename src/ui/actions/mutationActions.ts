import type { ReactNode } from 'react'

import {
  UI_ACTION_VERB_CREATE,
  UI_ACTION_VERB_DELETE,
  UI_ACTION_VERB_RESUME,
  UI_ACTION_VERB_SUSPEND,
  UI_ACTION_VERB_UPDATE,
} from '../constants'
import type { UiActionMenuItem, UiVisibilityProps } from '../types'
import { createActionMenuItems, type UiActionDefinition, type UiActionPayloadMap } from './createActionMenuItems'

export type MutationAdapter<TPayload, TData = unknown> = {
  mutateAsync: (payload: TPayload) => Promise<TData>
  isPending: boolean
}

export type MutationActionDefinition<
  PayloadMap extends UiActionPayloadMap,
  TType extends keyof PayloadMap = keyof PayloadMap,
  TData = unknown,
  TError = Error,
> = Omit<UiActionDefinition<PayloadMap, TType>, 'onSelect'> &
  UiVisibilityProps & {
    mutation: MutationAdapter<PayloadMap[TType], TData>
    onSuccess?: (data: TData, payload: PayloadMap[TType]) => void
    onError?: (error: TError, payload: PayloadMap[TType]) => void
  }

const toActionDefinition = <PayloadMap extends UiActionPayloadMap, TType extends keyof PayloadMap>(
  definition: MutationActionDefinition<PayloadMap, TType>
): UiActionDefinition<PayloadMap, TType> => ({
  ...definition,
  disabled: definition.disabled ?? definition.mutation.isPending,
  onSelect: async (payload) => {
    try {
      const result = await definition.mutation.mutateAsync(payload)
      definition.onSuccess?.(result, payload)
    } catch (error) {
      definition.onError?.(error as Error, payload)
    }
  },
})

export const createTypedActionMenuItems = <PayloadMap extends UiActionPayloadMap>(
  definitions: readonly MutationActionDefinition<PayloadMap>[]
): UiActionMenuItem[] => createActionMenuItems(definitions.map((definition) => toActionDefinition(definition)))

type MutationMap<PayloadMap extends UiActionPayloadMap> = {
  [K in keyof PayloadMap]?: MutationAdapter<PayloadMap[K]>
}

export type MutationActionConfig<
  PayloadMap extends UiActionPayloadMap,
  TType extends keyof PayloadMap = keyof PayloadMap,
> = Omit<MutationActionDefinition<PayloadMap, TType>, 'mutation'>

export const createMutationActions = <PayloadMap extends UiActionPayloadMap>(
  mutations: MutationMap<PayloadMap>,
  configs: readonly MutationActionConfig<PayloadMap>[]
): UiActionMenuItem[] => {
  const definitions = configs.map((config) => {
    const mutation = mutations[config.id]
    if (!mutation) {
      throw new Error(`Missing mutation for action ${String(config.id)}`)
    }
    return {
      ...config,
      mutation,
    } satisfies MutationActionDefinition<PayloadMap>
  })

  return createTypedActionMenuItems(definitions)
}

type CrudMutationEntry<TPayload> = UiVisibilityProps & {
  mutation: MutationAdapter<TPayload>
  buildPayload: () => TPayload
  label?: ReactNode
  icon?: ReactNode
  testId?: string
  disabled?: boolean
  onSuccess?: (data: unknown, payload: TPayload) => void
  onError?: (error: unknown, payload: TPayload) => void
}

export type CrudActionConfig<
  TIdentifierPayload,
  TCreatePayload = TIdentifierPayload,
  TUpdatePayload = TIdentifierPayload,
> = {
  create?: CrudMutationEntry<TCreatePayload>
  update?: CrudMutationEntry<TUpdatePayload>
  delete?: CrudMutationEntry<TIdentifierPayload>
  suspend?: CrudMutationEntry<TIdentifierPayload>
  resume?: CrudMutationEntry<TIdentifierPayload>
}

type CrudPayloadMap = {
  create: unknown
  update: unknown
  delete: unknown
  suspend: unknown
  resume: unknown
}

const CRUD_VERB_LABELS: Record<keyof CrudPayloadMap, string> = {
  create: UI_ACTION_VERB_CREATE,
  update: UI_ACTION_VERB_UPDATE,
  delete: UI_ACTION_VERB_DELETE,
  suspend: UI_ACTION_VERB_SUSPEND,
  resume: UI_ACTION_VERB_RESUME,
}

export const createCrudActions = <
  TIdentifierPayload,
  TCreatePayload = TIdentifierPayload,
  TUpdatePayload = TIdentifierPayload,
>(
  entityLabel: string,
  config: CrudActionConfig<TIdentifierPayload, TCreatePayload, TUpdatePayload>
): UiActionMenuItem[] => {
  const definitions: MutationActionDefinition<CrudPayloadMap>[] = []

  const pushDefinition = <TKey extends keyof CrudPayloadMap>(
    id: TKey,
    entry: CrudMutationEntry<CrudPayloadMap[TKey]>
  ) => {
    const verb = CRUD_VERB_LABELS[id]
    definitions.push({
      id,
      label: entry.label ?? `${verb} ${entityLabel}`,
      icon: entry.icon,
      testId: entry.testId,
      ability: entry.ability,
      permissionKey: entry.permissionKey,
      permissionFallback: entry.permissionFallback,
      disabled: entry.disabled,
      buildPayload: entry.buildPayload as () => CrudPayloadMap[TKey],
      mutation: entry.mutation as MutationAdapter<CrudPayloadMap[TKey]>,
      onSuccess: entry.onSuccess as ((data: unknown, payload: CrudPayloadMap[TKey]) => void) | undefined,
      onError: entry.onError as ((error: unknown, payload: CrudPayloadMap[TKey]) => void) | undefined,
    })
  }

  if (config.create) {
    pushDefinition('create', config.create as CrudMutationEntry<CrudPayloadMap['create']>)
  }
  if (config.update) {
    pushDefinition('update', config.update as CrudMutationEntry<CrudPayloadMap['update']>)
  }
  if (config.delete) {
    pushDefinition('delete', config.delete as CrudMutationEntry<CrudPayloadMap['delete']>)
  }
  if (config.suspend) {
    pushDefinition('suspend', config.suspend as CrudMutationEntry<CrudPayloadMap['suspend']>)
  }
  if (config.resume) {
    pushDefinition('resume', config.resume as CrudMutationEntry<CrudPayloadMap['resume']>)
  }

  return createTypedActionMenuItems(definitions)
}
