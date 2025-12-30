import { describe, expect, it, beforeEach } from 'vitest'
import {
  useAppStore,
  selectSurface,
  selectErrorSurface,
  selectErrorByScope,
  selectLatestError,
  selectErrorViewModel,
  selectLoadingByScope,
  selectAnyLoading,
  selectUser,
  selectPermissions,
  selectNavigationIntent,
  selectData,
} from '@/app/state/store'
import { buildUser } from '@test/factories/userFactory'
import {
  APP_ERROR_CODE_UNEXPECTED,
  APP_ERROR_TYPE_SERVER,
  APP_ERROR_TYPE_VALIDATION,
} from '@/app/constants'
import { faker } from '@faker-js/faker'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      user: null,
      permissions: { viewDashboard: false, viewLicenses: false, viewProducts: false, viewUsers: false, viewTenants: false, canEdit: false, canDelete: false, canCreate: false, vendorId: null },
      data: {},
      surface: { errors: {}, lastScope: null, loading: {} },
      navigationIntent: null,
    })
  })

  describe('error/raise action', () => {
    it('adds error to surface with scope', () => {
      const store = useAppStore.getState()
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }

      store.dispatch({ type: 'error/raise', payload: error })

      const state = useAppStore.getState()
      expect(state.surface.errors.data).toEqual({ ...error, scope: 'data' })
      expect(state.surface.lastScope).toBe('data')
    })

    it('uses global scope when scope is not provided', () => {
      const store = useAppStore.getState()
      const error = {
        type: APP_ERROR_TYPE_VALIDATION,
        code: 'VALIDATION_ERROR',
        message: faker.lorem.sentence(),
        scope: 'global' as const,
      }

      store.dispatch({ type: 'error/raise', payload: error })

      const state = useAppStore.getState()
      expect(state.surface.errors.global).toEqual({ ...error, scope: 'global' })
      expect(state.surface.lastScope).toBe('global')
    })

    it('replaces existing error in same scope', () => {
      const store = useAppStore.getState()
      const firstError = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'FIRST_ERROR',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }
      const secondError = {
        type: APP_ERROR_TYPE_VALIDATION,
        code: 'SECOND_ERROR',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }

      store.dispatch({ type: 'error/raise', payload: firstError })
      store.dispatch({ type: 'error/raise', payload: secondError })

      const state = useAppStore.getState()
      expect(state.surface.errors.data).toEqual({ ...secondError, scope: 'data' })
      expect(state.surface.lastScope).toBe('data')
    })
  })

  describe('error/clear action', () => {
    it('clears specific scope error', () => {
      const store = useAppStore.getState()
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }

      store.dispatch({ type: 'error/raise', payload: error })
      store.dispatch({ type: 'error/clear', scope: 'data' })

      const state = useAppStore.getState()
      expect(state.surface.errors.data).toBeUndefined()
      expect(state.surface.lastScope).toBeNull()
    })

    it('clears all errors when scope is not provided', () => {
      const store = useAppStore.getState()
      const error1 = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'ERROR_1',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }
      const error2 = {
        type: APP_ERROR_TYPE_VALIDATION,
        code: 'ERROR_2',
        message: faker.lorem.sentence(),
        scope: 'global' as const,
      }

      store.dispatch({ type: 'error/raise', payload: error1 })
      store.dispatch({ type: 'error/raise', payload: error2 })
      store.dispatch({ type: 'error/clear' })

      const state = useAppStore.getState()
      expect(state.surface.errors).toEqual({})
      expect(state.surface.lastScope).toBeNull()
    })

    it('preserves lastScope when clearing different scope', () => {
      const store = useAppStore.getState()
      const error1 = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'ERROR_1',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }
      const error2 = {
        type: APP_ERROR_TYPE_VALIDATION,
        code: 'ERROR_2',
        message: faker.lorem.sentence(),
        scope: 'global' as const,
      }

      store.dispatch({ type: 'error/raise', payload: error1 })
      store.dispatch({ type: 'error/raise', payload: error2 })
      store.dispatch({ type: 'error/clear', scope: 'data' })

      const state = useAppStore.getState()
      expect(state.surface.errors.data).toBeUndefined()
      expect(state.surface.errors.global).toEqual({ ...error2, scope: 'global' })
      expect(state.surface.lastScope).toBe('global')
    })
  })

  describe('loading/set action', () => {
    it('sets loading state for scope', () => {
      const store = useAppStore.getState()

      store.dispatch({ type: 'loading/set', scope: 'data', isLoading: true })

      const state = useAppStore.getState()
      expect(state.surface.loading.data).toBe(true)
    })

    it('clears loading state for scope', () => {
      const store = useAppStore.getState()

      store.dispatch({ type: 'loading/set', scope: 'data', isLoading: true })
      store.dispatch({ type: 'loading/set', scope: 'data', isLoading: false })

      const state = useAppStore.getState()
      expect(state.surface.loading.data).toBe(false)
    })

    it('handles multiple loading scopes independently', () => {
      const store = useAppStore.getState()

      store.dispatch({ type: 'loading/set', scope: 'data', isLoading: true })
      store.dispatch({ type: 'loading/set', scope: 'global', isLoading: true })
      store.dispatch({ type: 'loading/set', scope: 'data', isLoading: false })

      const state = useAppStore.getState()
      expect(state.surface.loading.data).toBe(false)
      expect(state.surface.loading.global).toBe(true)
    })
  })

  describe('auth/setUser action', () => {
    it('sets user and derives permissions', () => {
      const store = useAppStore.getState()
      const user = buildUser({ role: 'ADMIN' })

      store.dispatch({ type: 'auth/setUser', payload: user })

      const state = useAppStore.getState()
      expect(state.user).toEqual(user)
      expect(state.permissions).toBeDefined()
    })

    it('clears user when set to null', () => {
      const store = useAppStore.getState()
      const user = buildUser()

      store.dispatch({ type: 'auth/setUser', payload: user })
      store.dispatch({ type: 'auth/setUser', payload: null })

      const state = useAppStore.getState()
      expect(state.user).toBeNull()
    })
  })

  describe('data/patch action', () => {
    it('merges data into existing state', () => {
      const store = useAppStore.getState()
      const initialData = { key1: faker.word.sample() }
      useAppStore.setState({ data: initialData })

      store.dispatch({ type: 'data/patch', payload: { key2: faker.word.sample() } })

      const state = useAppStore.getState()
      expect(state.data.key1).toBe(initialData.key1)
      expect(state.data.key2).toBeDefined()
    })

    it('overwrites existing keys', () => {
      const store = useAppStore.getState()
      const initialData = { key1: faker.word.sample() }
      useAppStore.setState({ data: initialData })
      const newValue = faker.word.sample()

      store.dispatch({ type: 'data/patch', payload: { key1: newValue } })

      const state = useAppStore.getState()
      expect(state.data.key1).toBe(newValue)
    })
  })

  describe('nav/intent action', () => {
    it('sets navigation intent', () => {
      const store = useAppStore.getState()
      const intent = {
        to: faker.internet.url(),
        replace: faker.datatype.boolean(),
      }

      store.dispatch({ type: 'nav/intent', payload: intent })

      const state = useAppStore.getState()
      expect(state.navigationIntent).toEqual(intent)
    })

    it('clears navigation intent when set to null', () => {
      const store = useAppStore.getState()
      const intent = {
        to: faker.internet.url(),
      }

      store.dispatch({ type: 'nav/intent', payload: intent })
      store.dispatch({ type: 'nav/intent', payload: null })

      const state = useAppStore.getState()
      expect(state.navigationIntent).toBeNull()
    })
  })

  describe('nav/clearIntent action', () => {
    it('clears navigation intent', () => {
      const store = useAppStore.getState()
      const intent = {
        to: faker.internet.url(),
      }

      store.dispatch({ type: 'nav/intent', payload: intent })
      store.dispatch({ type: 'nav/clearIntent' })

      const state = useAppStore.getState()
      expect(state.navigationIntent).toBeNull()
    })
  })

  describe('selectors', () => {
    it('selectSurface returns surface state', () => {
      const state = useAppStore.getState()
      const surface = selectSurface(state)
      expect(surface).toBeDefined()
      expect(surface).toEqual(state.surface)
    })

    it('selectErrorSurface returns latest error', () => {
      const store = useAppStore.getState()
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }
      store.dispatch({ type: 'error/raise', payload: error })

      const state = useAppStore.getState()
      const selectedError = selectErrorSurface(state)
      expect(selectedError).toEqual({ ...error, scope: 'data' })
    })

    it('selectErrorByScope returns error for specific scope', () => {
      const store = useAppStore.getState()
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }
      store.dispatch({ type: 'error/raise', payload: error })

      const state = useAppStore.getState()
      const selectedError = selectErrorByScope('data')(state)
      expect(selectedError).toEqual({ ...error, scope: 'data' })
    })

    it('selectLatestError returns latest error', () => {
      const store = useAppStore.getState()
      const error1 = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'ERROR_1',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }
      const error2 = {
        type: APP_ERROR_TYPE_VALIDATION,
        code: 'ERROR_2',
        message: faker.lorem.sentence(),
        scope: 'global' as const,
      }
      store.dispatch({ type: 'error/raise', payload: error1 })
      store.dispatch({ type: 'error/raise', payload: error2 })

      const state = useAppStore.getState()
      const latestError = selectLatestError(state)
      expect(latestError).toEqual({ ...error2, scope: 'global' })
    })

    it('selectErrorViewModel returns formatted error view model', () => {
      const store = useAppStore.getState()
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'TEST_ERROR',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
        requestId: faker.string.uuid(),
        correlationId: faker.string.uuid(),
      }
      store.dispatch({ type: 'error/raise', payload: error })

      const state = useAppStore.getState()
      const viewModel = selectErrorViewModel('data')(state)
      expect(viewModel).toEqual({
        id: error.correlationId,
        code: error.code,
        message: error.message,
        type: error.type,
        status: error.status,
        scope: 'data',
        requestId: error.requestId,
        correlationId: error.correlationId,
      })
    })

    it('selectLoadingByScope returns loading state for scope', () => {
      const store = useAppStore.getState()
      store.dispatch({ type: 'loading/set', scope: 'data', isLoading: true })

      const state = useAppStore.getState()
      const isLoading = selectLoadingByScope('data')(state)
      expect(isLoading).toBe(true)
    })

    it('selectAnyLoading returns true when any scope is loading', () => {
      const store = useAppStore.getState()
      store.dispatch({ type: 'loading/set', scope: 'data', isLoading: true })

      const state = useAppStore.getState()
      const anyLoading = selectAnyLoading(state)
      expect(anyLoading).toBe(true)
    })

    it('selectAnyLoading returns false when no scope is loading', () => {
      const state = useAppStore.getState()
      const anyLoading = selectAnyLoading(state)
      expect(anyLoading).toBe(false)
    })

    it('selectUser returns user', () => {
      const store = useAppStore.getState()
      const user = buildUser()
      store.dispatch({ type: 'auth/setUser', payload: user })

      const state = useAppStore.getState()
      const selectedUser = selectUser(state)
      expect(selectedUser).toEqual(user)
    })

    it('selectPermissions returns permissions', () => {
      const store = useAppStore.getState()
      const user = buildUser()
      store.dispatch({ type: 'auth/setUser', payload: user })

      const state = useAppStore.getState()
      const permissions = selectPermissions(state)
      expect(permissions).toBeDefined()
    })

    it('selectNavigationIntent returns navigation intent', () => {
      const store = useAppStore.getState()
      const intent = {
        to: faker.internet.url(),
      }
      store.dispatch({ type: 'nav/intent', payload: intent })

      const state = useAppStore.getState()
      const selectedIntent = selectNavigationIntent(state)
      expect(selectedIntent).toEqual(intent)
    })

    it('selectData returns data', () => {
      const store = useAppStore.getState()
      const testData = { key: faker.word.sample() }
      store.dispatch({ type: 'data/patch', payload: testData })

      const state = useAppStore.getState()
      const selectedData = selectData(state)
      expect(selectedData.key).toBe(testData.key)
    })

    it('selectErrorByScope returns null for non-existent scope', () => {
      const state = useAppStore.getState()
      const error = selectErrorByScope('data')(state)
      expect(error).toBeNull()
    })

    it('selectErrorViewModel returns null when no error exists', () => {
      const state = useAppStore.getState()
      const viewModel = selectErrorViewModel('data')(state)
      expect(viewModel).toBeNull()
    })

    it('selectErrorViewModel uses correlationId as id when available', () => {
      const store = useAppStore.getState()
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'TEST_ERROR',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
        correlationId: faker.string.uuid(),
        requestId: faker.string.uuid(),
      }
      store.dispatch({ type: 'error/raise', payload: error })

      const state = useAppStore.getState()
      const viewModel = selectErrorViewModel('data')(state)
      expect(viewModel?.id).toBe(error.correlationId)
    })

    it('selectErrorViewModel falls back to requestId when correlationId is missing', () => {
      const store = useAppStore.getState()
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'TEST_ERROR',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
        requestId: faker.string.uuid(),
      }
      store.dispatch({ type: 'error/raise', payload: error })

      const state = useAppStore.getState()
      const viewModel = selectErrorViewModel('data')(state)
      expect(viewModel?.id).toBe(error.requestId)
    })

    it('selectErrorViewModel falls back to code when both ids are missing', () => {
      const store = useAppStore.getState()
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'TEST_ERROR',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }
      store.dispatch({ type: 'error/raise', payload: error })

      const state = useAppStore.getState()
      const viewModel = selectErrorViewModel('data')(state)
      expect(viewModel?.id).toBe(error.code)
    })

    it('selectLatestError returns null when no errors exist', () => {
      const state = useAppStore.getState()
      const latestError = selectLatestError(state)
      expect(latestError).toBeNull()
    })

    it('selectLatestError returns last scope error when lastScope is set', () => {
      const store = useAppStore.getState()
      const error1 = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'ERROR_1',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }
      const error2 = {
        type: APP_ERROR_TYPE_VALIDATION,
        code: 'ERROR_2',
        message: faker.lorem.sentence(),
        scope: 'global' as const,
      }
      store.dispatch({ type: 'error/raise', payload: error1 })
      store.dispatch({ type: 'error/raise', payload: error2 })

      const state = useAppStore.getState()
      const latestError = selectLatestError(state)
      expect(latestError).toEqual({ ...error2, scope: 'global' })
    })

    it('selectLatestError returns last error by key order when lastScope is null', () => {
      const store = useAppStore.getState()
      const error1 = {
        type: APP_ERROR_TYPE_SERVER,
        code: 'ERROR_1',
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }
      const error2 = {
        type: APP_ERROR_TYPE_VALIDATION,
        code: 'ERROR_2',
        message: faker.lorem.sentence(),
        scope: 'global' as const,
      }
      store.dispatch({ type: 'error/raise', payload: error1 })
      store.dispatch({ type: 'error/raise', payload: error2 })
      store.dispatch({ type: 'error/clear', scope: 'global' })

      const state = useAppStore.getState()
      const latestError = selectLatestError(state)
      expect(latestError).toEqual({ ...error1, scope: 'data' })
    })
  })
})
