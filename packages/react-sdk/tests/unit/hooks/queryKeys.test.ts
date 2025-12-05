/**
 * Tests for queryKeys
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest'
import { QUERY_KEYS } from '@/hooks/queryKeys'
import {
  TEST_LICENSE_KEY,
  TEST_LICENSE_STATUS_ACTIVE,
  TEST_PRODUCT_ID,
  TEST_TENANT_ID,
  TEST_USER_ID,
} from '../../constants'

describe('QUERY_KEYS', () => {
  describe('auth', () => {
    it('should return auth currentUser key', () => {
      const key = QUERY_KEYS.auth.currentUser()
      expect(key).toEqual(['auth', 'currentUser'])
    })

    it('should return auth token key', () => {
      const key = QUERY_KEYS.auth.token()
      expect(key).toEqual(['auth', 'token'])
    })
  })

  describe('licenses', () => {
    it('should return licenses all key', () => {
      const key = QUERY_KEYS.licenses.all()
      expect(key).toEqual(['licenses'])
    })

    it('should return license detail key', () => {
      const key = QUERY_KEYS.licenses.detail(TEST_LICENSE_KEY)
      expect(key).toEqual(['licenses', TEST_LICENSE_KEY])
    })

    it('should return license features key', () => {
      const key = QUERY_KEYS.licenses.features(TEST_LICENSE_KEY)
      expect(key).toEqual(['licenses', TEST_LICENSE_KEY, 'features'])
    })

    it('should return license data key', () => {
      const key = QUERY_KEYS.licenses.data(TEST_LICENSE_KEY)
      expect(key).toEqual(['licenses', TEST_LICENSE_KEY, 'data'])
    })
  })

  describe('adminLicenses', () => {
    it('should return admin licenses all key without filters', () => {
      const key = QUERY_KEYS.adminLicenses.all()
      expect(key).toEqual(['admin', 'licenses', undefined])
    })

    it('should return admin licenses all key with filters', () => {
      const filters = { status: TEST_LICENSE_STATUS_ACTIVE }
      const key = QUERY_KEYS.adminLicenses.all(filters)
      expect(key).toEqual(['admin', 'licenses', filters])
    })

    it('should return admin license detail key', () => {
      const key = QUERY_KEYS.adminLicenses.detail(TEST_LICENSE_KEY)
      expect(key).toEqual(['admin', 'licenses', TEST_LICENSE_KEY])
    })

    it('should return admin license activations key', () => {
      const key = QUERY_KEYS.adminLicenses.activations(TEST_LICENSE_KEY)
      expect(key).toEqual(['admin', 'licenses', TEST_LICENSE_KEY, 'activations'])
    })
  })

  describe('adminProducts', () => {
    it('should return admin products all key', () => {
      const key = QUERY_KEYS.adminProducts.all()
      expect(key).toEqual(['admin', 'products'])
    })

    it('should return admin product detail key', () => {
      const key = QUERY_KEYS.adminProducts.detail(TEST_PRODUCT_ID)
      expect(key).toEqual(['admin', 'products', TEST_PRODUCT_ID])
    })
  })

  describe('adminProductTiers', () => {
    it('should return admin product tiers all key', () => {
      const key = QUERY_KEYS.adminProductTiers.all(TEST_PRODUCT_ID)
      expect(key).toEqual(['admin', 'products', TEST_PRODUCT_ID, 'tiers'])
    })

    it('should return admin product tier detail key', () => {
      const tierId = 'tier-123'
      const key = QUERY_KEYS.adminProductTiers.detail(tierId)
      expect(key).toEqual(['admin', 'product-tiers', tierId])
    })
  })

  describe('adminEntitlements', () => {
    it('should return admin entitlements all key', () => {
      const key = QUERY_KEYS.adminEntitlements.all(TEST_PRODUCT_ID)
      expect(key).toEqual(['admin', 'products', TEST_PRODUCT_ID, 'entitlements'])
    })

    it('should return admin entitlement detail key', () => {
      const entitlementId = 'entitlement-123'
      const key = QUERY_KEYS.adminEntitlements.detail(entitlementId)
      expect(key).toEqual(['admin', 'entitlements', entitlementId])
    })
  })

  describe('adminUsers', () => {
    it('should return admin users all key', () => {
      const key = QUERY_KEYS.adminUsers.all()
      expect(key).toEqual(['admin', 'users'])
    })

    it('should return admin user detail key', () => {
      const key = QUERY_KEYS.adminUsers.detail(TEST_USER_ID)
      expect(key).toEqual(['admin', 'users', TEST_USER_ID])
    })

    it('should return admin users current key', () => {
      const key = QUERY_KEYS.adminUsers.current()
      expect(key).toEqual(['admin', 'users', 'me'])
    })
  })

  describe('adminTenants', () => {
    it('should return admin tenants all key', () => {
      const key = QUERY_KEYS.adminTenants.all()
      expect(key).toEqual(['admin', 'tenants'])
    })

    it('should return admin tenant detail key', () => {
      const key = QUERY_KEYS.adminTenants.detail(TEST_TENANT_ID)
      expect(key).toEqual(['admin', 'tenants', TEST_TENANT_ID])
    })

    it('should return admin tenant quota usage key', () => {
      const key = QUERY_KEYS.adminTenants.quotaUsage(TEST_TENANT_ID)
      expect(key).toEqual(['admin', 'tenants', TEST_TENANT_ID, 'quota', 'usage'])
    })

    it('should return admin tenant quota config key', () => {
      const key = QUERY_KEYS.adminTenants.quotaConfig(TEST_TENANT_ID)
      expect(key).toEqual(['admin', 'tenants', TEST_TENANT_ID, 'quota', 'config'])
    })
  })

  describe('adminAnalytics', () => {
    it('should return admin analytics stats key', () => {
      const key = QUERY_KEYS.adminAnalytics.stats()
      expect(key).toEqual(['admin', 'analytics', 'stats'])
    })

    it('should return admin analytics usage key', () => {
      const key = QUERY_KEYS.adminAnalytics.usage()
      expect(key).toEqual(['admin', 'analytics', 'usage'])
    })

    it('should return admin analytics trends key', () => {
      const key = QUERY_KEYS.adminAnalytics.trends()
      expect(key).toEqual(['admin', 'analytics', 'trends'])
    })
  })

  describe('adminAudit', () => {
    it('should return audit logs key without filters', () => {
      const key = QUERY_KEYS.adminAudit.logs()
      expect(key).toEqual(['admin', 'audit', 'logs', null])
    })

    it('should return audit logs key with filters', () => {
      const filters = { adminId: TEST_USER_ID }
      const key = QUERY_KEYS.adminAudit.logs(filters)
      expect(key).toEqual(['admin', 'audit', 'logs', filters])
    })

    it('should return audit verification key with params', () => {
      const params = { fromId: '1', toId: '5' }
      const key = QUERY_KEYS.adminAudit.verify(params)
      expect(key).toEqual(['admin', 'audit', 'verify', params])
    })

    it('should return audit verification key without params', () => {
      const key = QUERY_KEYS.adminAudit.verify()
      expect(key).toEqual(['admin', 'audit', 'verify', null])
    })
  })

  describe('adminSystem', () => {
    it('should return system status key', () => {
      const key = QUERY_KEYS.adminSystem.status()
      expect(key).toEqual(['admin', 'system', 'status'])
    })

    it('should return system health key', () => {
      const key = QUERY_KEYS.adminSystem.health()
      expect(key).toEqual(['admin', 'system', 'health'])
    })

    it('should return system metrics key', () => {
      const key = QUERY_KEYS.adminSystem.metrics()
      expect(key).toEqual(['admin', 'system', 'metrics'])
    })
  })
})
