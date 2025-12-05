import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Client } from '@/client'
import {
  ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED,
  ERROR_CODE_LICENSE_EXPIRED,
  ERROR_CODE_LICENSE_NOT_FOUND,
} from '@/constants'
import {
  ActivationLimitExceededException,
  ApiException,
  AuthenticationException,
  LicenseExpiredException,
  LicenseNotFoundException,
} from '@/exceptions/ApiException'
import type { AxiosHttpClient } from '@/http/AxiosHttpClient'
import type { HttpClientInterface } from '@/http/HttpClientInterface'
import type { ApiResponse } from '@/types/api'
import {
  TEST_ADMIN_ROLE,
  TEST_AUTH_TOKEN,
  TEST_AUTH_TOKEN_EXPIRES_IN,
  TEST_BASE_URL,
  TEST_BOOLEAN_FALSE,
  TEST_BOOLEAN_TRUE,
  TEST_CLIENT_VERSION,
  TEST_CUSTOMER_EMAIL,
  TEST_DOMAIN,
  TEST_EMAIL,
  TEST_HTTP_STATUS_OK,
  TEST_LICENSE_KEY,
  TEST_LICENSE_STATUS_ACTIVE,
  TEST_NUMBER_HUNDRED,
  TEST_NUMBER_ONE,
  TEST_NUMBER_TEN,
  TEST_NUMBER_ZERO,
  TEST_PASSWORD,
  TEST_PRODUCT_ID,
  TEST_PRODUCT_NAME,
  TEST_PRODUCT_SLUG,
  TEST_STATUS_HEALTHY,
  TEST_STATUS_UNHEALTHY,
  TEST_TENANT_ID,
  TEST_TENANT_NAME,
  TEST_TIER_CODE_PROFESSIONAL,
  TEST_USER_ID,
  TEST_USERNAME,
  TEST_WS_PATH_CUSTOM,
  TEST_WS_PATH_HEALTH,
  TEST_WS_PROTOCOL_SECURE,
  TEST_BASE_URL_WITH_SLASH,
} from '../../constants'
import { createLicense } from '../../factories/license'
import { createErrorResponse, createHttpResponse, createSuccessResponse } from '../../factories/response'

describe('Client', () => {
  let mockHttpClient: HttpClientInterface
  let client: Client

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClientInterface

    client = new Client(TEST_BASE_URL, mockHttpClient)
  })

  describe('constructor', () => {
    it('should create client with base URL', () => {
      const newClient = new Client('https://api.example.com')
      expect(newClient).toBeInstanceOf(Client)
    })

    it('should create client with custom HTTP client', () => {
      expect(client).toBeInstanceOf(Client)
    })
  })

  describe('base URL helpers', () => {
    it('returns normalized base URL without trailing slash', () => {
      const urlClient = new Client(TEST_BASE_URL_WITH_SLASH, mockHttpClient)
      expect(urlClient.getBaseUrl()).toBe(TEST_BASE_URL)
    })

    it('builds secure WebSocket URL with default path', () => {
      const wsUrl = client.getWebSocketUrl()
      const expected = `${TEST_WS_PROTOCOL_SECURE}${new URL(TEST_BASE_URL).host}${TEST_WS_PATH_HEALTH}`
      expect(wsUrl).toBe(expected)
    })

    it('builds WebSocket URL with custom path', () => {
      const wsUrl = client.getWebSocketUrl(TEST_WS_PATH_CUSTOM)
      const expected = `${TEST_WS_PROTOCOL_SECURE}${new URL(TEST_BASE_URL).host}${TEST_WS_PATH_CUSTOM}`
      expect(wsUrl).toBe(expected)
    })
  })

  describe('authentication', () => {
    it('should login and set token', async () => {
      const loginData = {
        token: TEST_AUTH_TOKEN,
        token_type: 'Bearer',
        expires_in: TEST_AUTH_TOKEN_EXPIRES_IN,
        user: {
          id: TEST_USER_ID,
          username: TEST_USERNAME,
          email: TEST_EMAIL,
        },
      }
      const response = createHttpResponse(createSuccessResponse(loginData))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.login(TEST_USERNAME, TEST_PASSWORD)

      expect(result.token).toBe(TEST_AUTH_TOKEN)
      expect(result.expires_in).toBe(TEST_AUTH_TOKEN_EXPIRES_IN)
      expect(client.getToken()).toBe(TEST_AUTH_TOKEN)
    })

    it('should throw AuthenticationException on login failure', async () => {
      const errorResponse = createHttpResponse(
        createErrorResponse('INVALID_CREDENTIALS', 'Invalid credentials'),
        TEST_HTTP_STATUS_OK
      )

      vi.mocked(mockHttpClient.post).mockResolvedValue(errorResponse)

      await expect(client.login(TEST_USERNAME, TEST_PASSWORD)).rejects.toThrow(AuthenticationException)
    })

    it('should handle invalid login response format', async () => {
      const invalidResponse = createHttpResponse({ invalid: 'data' } as unknown as ApiResponse)

      vi.mocked(mockHttpClient.post).mockResolvedValue(invalidResponse)

      await expect(client.login(TEST_USERNAME, TEST_PASSWORD)).rejects.toThrow(AuthenticationException)
    })

    it('should handle login response without data', async () => {
      const response = createHttpResponse({
        success: false,
        error: { code: 'AUTH_ERROR', message: 'Failed' },
      } as ApiResponse)

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      await expect(client.login(TEST_USERNAME, TEST_PASSWORD)).rejects.toThrow(AuthenticationException)
    })

    it('should handle login response with non-object data', async () => {
      const response = createHttpResponse({
        success: true,
        data: 'invalid',
      } as ApiResponse)

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      await expect(client.login(TEST_USERNAME, TEST_PASSWORD)).rejects.toThrow(AuthenticationException)
    })

    it('should handle login response without token', async () => {
      const response = createHttpResponse({
        success: true,
        data: {
          expires_in: TEST_AUTH_TOKEN_EXPIRES_IN,
          user: {},
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      await expect(client.login(TEST_USERNAME, TEST_PASSWORD)).rejects.toThrow(AuthenticationException)
    })

    it('should set token directly', () => {
      client.setToken(TEST_AUTH_TOKEN, Date.now() + TEST_AUTH_TOKEN_EXPIRES_IN * 1000)
      expect(client.getToken()).toBe(TEST_AUTH_TOKEN)
    })

    it('should return null when no token set', () => {
      expect(client.getToken()).toBeNull()
    })

    it('should clear token when expired and call setAuthToken on AxiosHttpClient', () => {
      // Use a real AxiosHttpClient to test the instanceof check (line 209)
      const axiosClient = new Client(TEST_BASE_URL)
      // Access private property for testing - using type assertion to avoid bracket notation
      const httpClient = (axiosClient as unknown as { httpClient: AxiosHttpClient }).httpClient as AxiosHttpClient
      const mockSetAuthToken = vi.spyOn(httpClient, 'setAuthToken')

      // Set token that's already expired
      axiosClient.setToken(TEST_AUTH_TOKEN, Date.now() - 1000)

      // Call getToken which should trigger the expiration check and call setAuthToken(null)
      const token = axiosClient.getToken()

      expect(token).toBeNull()
      // Verify setAuthToken was called with null when token expires (covers line 209)
      expect(mockSetAuthToken).toHaveBeenCalledWith(null)

      mockSetAuthToken.mockRestore()
    })

    it('should clear token when expired', () => {
      client.setToken(TEST_AUTH_TOKEN, Date.now() - 1000)
      expect(client.getToken()).toBeNull()
    })

    it('should handle expired token with non-AxiosHttpClient', () => {
      // Create client with mock HTTP client that's not AxiosHttpClient
      const customHttpClient = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
      } as unknown as HttpClientInterface

      const customClient = new Client(TEST_BASE_URL, customHttpClient)
      customClient.setToken(TEST_AUTH_TOKEN, Date.now() - 1000)

      // Should still clear token even without AxiosHttpClient
      expect(customClient.getToken()).toBeNull()
    })
  })

  describe('public API - activateLicense', () => {
    it('should activate license successfully', async () => {
      const license = createLicense({ licenseKey: TEST_LICENSE_KEY })
      const activationData = {
        license,
        activation: {
          id: 'activation-123',
          licenseKey: TEST_LICENSE_KEY,
          domain: TEST_DOMAIN,
          status: 'ACTIVE' as const,
          activatedAt: new Date().toISOString(),
        },
      }
      const response = createHttpResponse(createSuccessResponse(activationData))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.activateLicense(TEST_LICENSE_KEY, TEST_DOMAIN)

      expect(result.license).toBeDefined()
      expect(result.activation).toBeDefined()
      expect(result.license.licenseKey).toBe(TEST_LICENSE_KEY)
    })

    it('should throw LicenseExpiredException when license expired', async () => {
      const errorResponse = createHttpResponse(
        createErrorResponse(ERROR_CODE_LICENSE_EXPIRED, 'License expired'),
        TEST_HTTP_STATUS_OK
      )

      vi.mocked(mockHttpClient.post).mockResolvedValue(errorResponse)

      await expect(client.activateLicense(TEST_LICENSE_KEY, TEST_DOMAIN)).rejects.toThrow(LicenseExpiredException)
    })

    it('should throw ActivationLimitExceededException when limit exceeded', async () => {
      const errorResponse = createHttpResponse(
        createErrorResponse(ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED, 'Activation limit exceeded'),
        TEST_HTTP_STATUS_OK
      )

      vi.mocked(mockHttpClient.post).mockResolvedValue(errorResponse)

      await expect(client.activateLicense(TEST_LICENSE_KEY, TEST_DOMAIN)).rejects.toThrow(
        ActivationLimitExceededException
      )
    })
  })

  describe('public API - validateLicense', () => {
    it('should validate license successfully', async () => {
      const license = createLicense({ licenseKey: TEST_LICENSE_KEY })
      const response = createHttpResponse(createSuccessResponse({ license }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.validateLicense(TEST_LICENSE_KEY, TEST_DOMAIN)

      expect(result.license).toBeDefined()
      expect(result.license.licenseKey).toBe(TEST_LICENSE_KEY)
    })

    it('should throw LicenseNotFoundException when license not found', async () => {
      const errorResponse = createHttpResponse(
        createErrorResponse(ERROR_CODE_LICENSE_NOT_FOUND, 'License not found'),
        TEST_HTTP_STATUS_OK
      )

      vi.mocked(mockHttpClient.post).mockResolvedValue(errorResponse)

      await expect(client.validateLicense(TEST_LICENSE_KEY, TEST_DOMAIN)).rejects.toThrow(LicenseNotFoundException)
    })
  })

  describe('public API - getLicenseData', () => {
    it('should get license data successfully', async () => {
      const license = createLicense({ licenseKey: TEST_LICENSE_KEY })
      const response = createHttpResponse(createSuccessResponse({ license }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getLicenseData(TEST_LICENSE_KEY)

      expect(result.license).toBeDefined()
      expect(result.license.licenseKey).toBe(TEST_LICENSE_KEY)
    })
  })

  describe('public API - deactivateLicense', () => {
    it('should deactivate license successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.deactivateLicense(TEST_LICENSE_KEY, TEST_DOMAIN)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('public API - getLicenseFeatures', () => {
    it('should get license features successfully', async () => {
      const featuresData = {
        features: {
          feature1: 'value1',
          feature2: TEST_NUMBER_ZERO,
          feature3: TEST_BOOLEAN_TRUE,
        },
        tier: {
          id: 'tier-123',
          productId: TEST_PRODUCT_ID,
          tierCode: TEST_TIER_CODE_PROFESSIONAL,
          tierName: 'Professional',
          isActive: TEST_BOOLEAN_TRUE,
          doesNotExpire: TEST_BOOLEAN_FALSE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
      const response = createHttpResponse(createSuccessResponse(featuresData))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getLicenseFeatures(TEST_LICENSE_KEY)

      expect(result.features).toBeDefined()
      expect(result.tier).toBeDefined()
    })
  })

  describe('public API - reportUsage', () => {
    it('should report usage successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.reportUsage({
        license_key: TEST_LICENSE_KEY,
        domain: TEST_DOMAIN,
        month: '2024-01',
      })

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('public API - checkUpdate', () => {
    it('should check for updates successfully', async () => {
      const updateData = {
        update_available: TEST_BOOLEAN_FALSE,
        latest_version: TEST_CLIENT_VERSION,
      }
      const response = createHttpResponse(createSuccessResponse(updateData))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.checkUpdate({
        license_key: TEST_LICENSE_KEY,
        domain: TEST_DOMAIN,
        slug: TEST_PRODUCT_SLUG,
        current_version: TEST_CLIENT_VERSION,
      })

      expect(result.update_available).toBeDefined()
    })
  })

  describe('admin API - licenses', () => {
    it('should list licenses successfully', async () => {
      const licenses = [createLicense(), createLicense()]
      const listResponse = {
        success: TEST_BOOLEAN_TRUE,
        data: licenses,
        pagination: {
          page: TEST_NUMBER_ONE,
          limit: TEST_NUMBER_TEN,
          total: TEST_NUMBER_TEN * 2,
          totalPages: TEST_NUMBER_ONE + 1,
        },
      }
      const response = createHttpResponse(createSuccessResponse(listResponse))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listLicenses()

      expect(result.data).toBeDefined()
      expect(result.pagination).toBeDefined()
    })

    it('should list licenses with filters', async () => {
      const licenses = [createLicense()]
      const listResponse = {
        success: TEST_BOOLEAN_TRUE,
        data: licenses,
        pagination: {
          page: TEST_NUMBER_ONE,
          limit: TEST_NUMBER_TEN,
          total: TEST_NUMBER_ONE,
          totalPages: TEST_NUMBER_ONE,
        },
      }
      const response = createHttpResponse(createSuccessResponse(listResponse))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listLicenses({
        status: TEST_LICENSE_STATUS_ACTIVE,
        product_slug: TEST_PRODUCT_SLUG,
      })

      expect(result.data).toBeDefined()
    })

    it('should list licenses with customer_email filter', async () => {
      const licenses = [createLicense()]
      const listResponse = {
        success: TEST_BOOLEAN_TRUE,
        data: licenses,
        pagination: {
          page: TEST_NUMBER_ONE,
          limit: TEST_NUMBER_TEN,
          total: TEST_NUMBER_ONE,
          totalPages: TEST_NUMBER_ONE,
        },
      }
      const response = createHttpResponse(createSuccessResponse(listResponse))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listLicenses({
        customer_email: TEST_CUSTOMER_EMAIL,
      })

      expect(result.data).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`customer_email=${encodeURIComponent(TEST_CUSTOMER_EMAIL)}`)
      )
    })

    it('should list licenses with limit filter', async () => {
      const licenses = [createLicense()]
      const listResponse = {
        success: TEST_BOOLEAN_TRUE,
        data: licenses,
        pagination: {
          page: TEST_NUMBER_ONE,
          limit: TEST_NUMBER_TEN,
          total: TEST_NUMBER_ONE,
          totalPages: TEST_NUMBER_ONE,
        },
      }
      const response = createHttpResponse(createSuccessResponse(listResponse))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listLicenses({
        limit: TEST_NUMBER_TEN,
      })

      expect(result.data).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining(`limit=${TEST_NUMBER_TEN}`))
    })

    it('should list licenses with offset filter', async () => {
      const licenses = [createLicense()]
      const listResponse = {
        success: TEST_BOOLEAN_TRUE,
        data: licenses,
        pagination: {
          page: TEST_NUMBER_ONE,
          limit: TEST_NUMBER_TEN,
          total: TEST_NUMBER_ONE,
          totalPages: TEST_NUMBER_ONE,
        },
      }
      const response = createHttpResponse(createSuccessResponse(listResponse))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listLicenses({
        offset: TEST_NUMBER_TEN,
      })

      expect(result.data).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining(`offset=${TEST_NUMBER_TEN}`))
    })

    it('should create license successfully', async () => {
      const license = createLicense()
      const response = createHttpResponse(createSuccessResponse({ license }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.createLicense({
        customer_email: TEST_CUSTOMER_EMAIL,
        product_slug: TEST_PRODUCT_SLUG,
        tier_code: TEST_TIER_CODE_PROFESSIONAL,
      })

      expect(result.license).toBeDefined()
    })

    it('should get license successfully', async () => {
      const license = createLicense({ licenseKey: TEST_LICENSE_KEY })
      const response = createHttpResponse(createSuccessResponse({ license }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getLicense(TEST_LICENSE_KEY)

      expect(result.license).toBeDefined()
    })

    it('should update license successfully', async () => {
      const license = createLicense()
      const response = createHttpResponse(createSuccessResponse({ license }))

      vi.mocked(mockHttpClient.put).mockResolvedValue(response)

      const result = await client.updateLicense(TEST_LICENSE_KEY, {
        tier_code: TEST_TIER_CODE_PROFESSIONAL,
      })

      expect(result.license).toBeDefined()
    })

    it('should suspend license successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.suspendLicense(TEST_LICENSE_KEY)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should resume license successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.resumeLicense(TEST_LICENSE_KEY)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should freeze license successfully', async () => {
      const license = createLicense()
      const response = createHttpResponse(createSuccessResponse({ license }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.freezeLicense(TEST_LICENSE_KEY)

      expect(result.license).toBeDefined()
    })

    it('should revoke license successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.delete).mockResolvedValue(response)

      const result = await client.revokeLicense(TEST_LICENSE_KEY)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should get license activations successfully', async () => {
      const activations = [
        {
          id: 'activation-1',
          licenseKey: TEST_LICENSE_KEY,
          domain: TEST_DOMAIN,
          status: 'ACTIVE' as const,
          activatedAt: new Date().toISOString(),
        },
      ]
      const response = createHttpResponse(createSuccessResponse({ activations }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getLicenseActivations(TEST_LICENSE_KEY)

      expect(result.activations).toBeDefined()
    })
  })

  describe('admin API - products', () => {
    it('should list products successfully', async () => {
      const products = [
        {
          id: TEST_PRODUCT_ID,
          slug: TEST_PRODUCT_SLUG,
          name: TEST_PRODUCT_NAME,
          isActive: TEST_BOOLEAN_TRUE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const listResponse = {
        success: TEST_BOOLEAN_TRUE,
        data: products,
        pagination: {
          page: TEST_NUMBER_ONE,
          limit: TEST_NUMBER_TEN,
          total: TEST_NUMBER_ONE,
          totalPages: TEST_NUMBER_ONE,
        },
      }
      const response = createHttpResponse(createSuccessResponse(listResponse))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listProducts()

      expect(result.data).toBeDefined()
    })

    it('should create product successfully', async () => {
      const product = {
        id: TEST_PRODUCT_ID,
        slug: TEST_PRODUCT_SLUG,
        name: TEST_PRODUCT_NAME,
        isActive: TEST_BOOLEAN_TRUE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ product }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.createProduct({
        name: TEST_PRODUCT_NAME,
        slug: TEST_PRODUCT_SLUG,
      })

      expect(result.product).toBeDefined()
    })

    it('should get product successfully', async () => {
      const product = {
        id: TEST_PRODUCT_ID,
        slug: TEST_PRODUCT_SLUG,
        name: TEST_PRODUCT_NAME,
        isActive: TEST_BOOLEAN_TRUE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ product }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getProduct(TEST_PRODUCT_ID)

      expect(result.product).toBeDefined()
    })

    it('should update product successfully', async () => {
      const product = {
        id: TEST_PRODUCT_ID,
        slug: TEST_PRODUCT_SLUG,
        name: TEST_PRODUCT_NAME,
        isActive: TEST_BOOLEAN_TRUE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ product }))

      vi.mocked(mockHttpClient.put).mockResolvedValue(response)

      const result = await client.updateProduct(TEST_PRODUCT_ID, { name: TEST_PRODUCT_NAME })

      expect(result.product).toBeDefined()
    })

    it('should delete product successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.delete).mockResolvedValue(response)

      const result = await client.deleteProduct(TEST_PRODUCT_ID)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should suspend product successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.suspendProduct(TEST_PRODUCT_ID)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should resume product successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.resumeProduct(TEST_PRODUCT_ID)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('admin API - product tiers', () => {
    it('should list product tiers successfully', async () => {
      const tiers = [
        {
          id: 'tier-123',
          productId: TEST_PRODUCT_ID,
          tierCode: TEST_TIER_CODE_PROFESSIONAL,
          tierName: 'Professional',
          isActive: TEST_BOOLEAN_TRUE,
          doesNotExpire: TEST_BOOLEAN_FALSE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const response = createHttpResponse(
        createSuccessResponse({
          data: tiers,
          pagination: {
            page: TEST_NUMBER_ONE,
            limit: TEST_NUMBER_TEN,
            total: TEST_NUMBER_ONE,
            totalPages: TEST_NUMBER_ONE,
          },
        })
      )

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listProductTiers(TEST_PRODUCT_ID)

      expect(result.data).toBeDefined()
    })

    it('should create product tier successfully', async () => {
      const tier = {
        id: 'tier-123',
        productId: TEST_PRODUCT_ID,
        tierCode: TEST_TIER_CODE_PROFESSIONAL,
        tierName: 'Professional',
        isActive: TEST_BOOLEAN_TRUE,
        doesNotExpire: TEST_BOOLEAN_FALSE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ tier }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.createProductTier(TEST_PRODUCT_ID, {
        name: 'Professional',
        code: TEST_TIER_CODE_PROFESSIONAL,
      })

      expect(result.tier).toBeDefined()
    })

    it('should get product tier successfully', async () => {
      const tier = {
        id: 'tier-123',
        productId: TEST_PRODUCT_ID,
        tierCode: TEST_TIER_CODE_PROFESSIONAL,
        tierName: 'Professional',
        isActive: TEST_BOOLEAN_TRUE,
        doesNotExpire: TEST_BOOLEAN_FALSE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ tier }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getProductTier('tier-123')

      expect(result.tier).toBeDefined()
    })

    it('should update product tier successfully', async () => {
      const tier = {
        id: 'tier-123',
        productId: TEST_PRODUCT_ID,
        tierCode: TEST_TIER_CODE_PROFESSIONAL,
        tierName: 'Professional',
        isActive: TEST_BOOLEAN_TRUE,
        doesNotExpire: TEST_BOOLEAN_FALSE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ tier }))

      vi.mocked(mockHttpClient.put).mockResolvedValue(response)

      const result = await client.updateProductTier('tier-123', { name: 'Professional' })

      expect(result.tier).toBeDefined()
    })

    it('should delete product tier successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.delete).mockResolvedValue(response)

      const result = await client.deleteProductTier('tier-123')

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('admin API - entitlements', () => {
    it('should list entitlements successfully', async () => {
      const entitlements = [
        {
          id: 'entitlement-123',
          productId: TEST_PRODUCT_ID,
          key: 'feature-key',
          value_type: 'boolean' as const,
          default_value: TEST_BOOLEAN_TRUE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const response = createHttpResponse(
        createSuccessResponse({
          data: entitlements,
          pagination: {
            page: TEST_NUMBER_ONE,
            limit: TEST_NUMBER_TEN,
            total: TEST_NUMBER_ONE,
            totalPages: TEST_NUMBER_ONE,
          },
        })
      )

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listEntitlements(TEST_PRODUCT_ID)

      expect(result.data).toBeDefined()
    })

    it('should create entitlement successfully', async () => {
      const entitlement = {
        id: 'entitlement-123',
        productId: TEST_PRODUCT_ID,
        key: 'feature-key',
        value_type: 'boolean' as const,
        default_value: TEST_BOOLEAN_TRUE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ entitlement }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.createEntitlement(TEST_PRODUCT_ID, {
        key: 'feature-key',
        value_type: 'boolean',
        default_value: TEST_BOOLEAN_TRUE,
      })

      expect(result.entitlement).toBeDefined()
    })

    it('should get entitlement successfully', async () => {
      const entitlement = {
        id: 'entitlement-123',
        productId: TEST_PRODUCT_ID,
        key: 'feature-key',
        value_type: 'boolean' as const,
        default_value: TEST_BOOLEAN_TRUE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ entitlement }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getEntitlement('entitlement-123')

      expect(result.entitlement).toBeDefined()
    })

    it('should update entitlement successfully', async () => {
      const entitlement = {
        id: 'entitlement-123',
        productId: TEST_PRODUCT_ID,
        key: 'feature-key',
        value_type: 'boolean' as const,
        default_value: TEST_BOOLEAN_TRUE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ entitlement }))

      vi.mocked(mockHttpClient.put).mockResolvedValue(response)

      const result = await client.updateEntitlement('entitlement-123', {
        default_value: TEST_BOOLEAN_FALSE,
      })

      expect(result.entitlement).toBeDefined()
    })

    it('should delete entitlement successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.delete).mockResolvedValue(response)

      const result = await client.deleteEntitlement('entitlement-123')

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('admin API - users', () => {
    it('should list users successfully', async () => {
      const users = [
        {
          id: TEST_USER_ID,
          username: TEST_USERNAME,
          email: TEST_EMAIL,
          role: TEST_ADMIN_ROLE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const response = createHttpResponse(
        createSuccessResponse({
          data: users,
          pagination: {
            page: TEST_NUMBER_ONE,
            limit: TEST_NUMBER_TEN,
            total: TEST_NUMBER_ONE,
            totalPages: TEST_NUMBER_ONE,
          },
        })
      )

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listUsers()

      expect(result.data).toBeDefined()
    })

    it('should create user successfully', async () => {
      const user = {
        id: TEST_USER_ID,
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        role: TEST_ADMIN_ROLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ user }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.createUser({
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })

      expect(result.user).toBeDefined()
    })

    it('should get user successfully', async () => {
      const user = {
        id: TEST_USER_ID,
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        role: TEST_ADMIN_ROLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ user }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getUser(TEST_USER_ID)

      expect(result.user).toBeDefined()
    })

    it('should update user successfully', async () => {
      const user = {
        id: TEST_USER_ID,
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        role: TEST_ADMIN_ROLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ user }))

      vi.mocked(mockHttpClient.put).mockResolvedValue(response)

      const result = await client.updateUser(TEST_USER_ID, { email: TEST_EMAIL })

      expect(result.user).toBeDefined()
    })

    it('should delete user successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.delete).mockResolvedValue(response)

      const result = await client.deleteUser(TEST_USER_ID)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should get current user successfully', async () => {
      const user = {
        id: TEST_USER_ID,
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        role: TEST_ADMIN_ROLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ user }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getCurrentUser()

      expect(result.user).toBeDefined()
    })

    it('should change password successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.patch).mockResolvedValue(response)

      const result = await client.changePassword({
        current_password: TEST_PASSWORD,
        new_password: TEST_PASSWORD,
      })

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })
  })

  describe('admin API - tenants', () => {
    it('should list tenants successfully', async () => {
      const tenants = [
        {
          id: TEST_TENANT_ID,
          name: TEST_TENANT_NAME,
          status: 'ACTIVE' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const response = createHttpResponse(
        createSuccessResponse({
          data: tenants,
          pagination: {
            page: TEST_NUMBER_ONE,
            limit: TEST_NUMBER_TEN,
            total: TEST_NUMBER_ONE,
            totalPages: TEST_NUMBER_ONE,
          },
        })
      )

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.listTenants()

      expect(result.data).toBeDefined()
    })

    it('should create tenant successfully', async () => {
      const tenant = {
        id: TEST_TENANT_ID,
        name: TEST_TENANT_NAME,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ tenant }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.createTenant({ name: TEST_TENANT_NAME })

      expect(result.tenant).toBeDefined()
    })

    it('should update tenant successfully', async () => {
      const tenant = {
        id: TEST_TENANT_ID,
        name: TEST_TENANT_NAME,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const response = createHttpResponse(createSuccessResponse({ tenant }))

      vi.mocked(mockHttpClient.put).mockResolvedValue(response)

      const result = await client.updateTenant(TEST_TENANT_ID, { name: TEST_TENANT_NAME })

      expect(result.tenant).toBeDefined()
    })

    it('should suspend tenant successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.suspendTenant(TEST_TENANT_ID)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should resume tenant successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.resumeTenant(TEST_TENANT_ID)

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should get quota usage successfully', async () => {
      const quotaUsage = {
        usage: {
          products_count: TEST_NUMBER_ONE,
          activations_count: TEST_NUMBER_TEN,
        },
      }
      const response = createHttpResponse(createSuccessResponse(quotaUsage))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getQuotaUsage(TEST_TENANT_ID)

      expect(result.usage).toBeDefined()
    })

    it('should get quota config successfully', async () => {
      const quotaConfig = {
        config: {
          max_products: TEST_NUMBER_TEN,
        },
      }
      const response = createHttpResponse(createSuccessResponse(quotaConfig))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getQuotaConfig(TEST_TENANT_ID)

      expect(result.config).toBeDefined()
    })

    it('should update quota limits successfully', async () => {
      const response = createHttpResponse(createSuccessResponse({ success: TEST_BOOLEAN_TRUE }))

      vi.mocked(mockHttpClient.put).mockResolvedValue(response)

      const result = await client.updateQuotaLimits(TEST_TENANT_ID, {
        max_products: TEST_NUMBER_TEN,
      })

      expect(result.success).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should create tenant backup successfully', async () => {
      const backup = {
        backup: {
          id: 'backup-1',
          backupName: 'tenant-backup',
          backupType: 'database',
          createdAt: new Date().toISOString(),
        },
      }
      const response = createHttpResponse(createSuccessResponse(backup))

      vi.mocked(mockHttpClient.post).mockResolvedValue(response)

      const result = await client.createTenantBackup(TEST_TENANT_ID)

      expect(result.backup).toBeDefined()
    })
  })

  describe('admin API - system monitoring', () => {
    it('should get server status successfully', async () => {
      const status = {
        status: TEST_STATUS_HEALTHY,
        timestamp: new Date().toISOString(),
        checks: {
          database: TEST_STATUS_HEALTHY,
        },
      }
      const response = createHttpResponse(createSuccessResponse(status))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getServerStatus()

      expect(result.status).toBe(TEST_STATUS_HEALTHY)
    })

    it('should get health metrics successfully', async () => {
      const metrics = {
        metrics: {
          uptime: TEST_NUMBER_TEN,
          memory: {
            rss: TEST_NUMBER_TEN,
            heapTotal: TEST_NUMBER_TEN,
            heapUsed: TEST_NUMBER_ONE,
            external: TEST_NUMBER_ZERO,
          },
          cpu: {
            user: TEST_NUMBER_ONE,
            system: TEST_NUMBER_ONE,
          },
        },
      }
      const response = createHttpResponse(createSuccessResponse(metrics))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getHealthMetrics()

      expect(result.metrics.uptime).toBe(TEST_NUMBER_TEN)
    })

    it('should get system metrics successfully', async () => {
      const metrics = {
        timestamp: new Date().toISOString(),
        application: {
          version: TEST_PRODUCT_NAME,
          environment: TEST_PRODUCT_SLUG,
        },
        system: {
          uptime: TEST_NUMBER_TEN,
          memory: {
            rss: TEST_NUMBER_TEN,
            heapTotal: TEST_NUMBER_TEN,
            heapUsed: TEST_NUMBER_ONE,
            external: TEST_NUMBER_ZERO,
          },
          cpu: {
            user: TEST_NUMBER_ONE,
            system: TEST_NUMBER_ONE,
          },
        },
        database: {
          status: TEST_STATUS_HEALTHY,
        },
        cache: {
          status: TEST_STATUS_UNHEALTHY,
        },
        security: {
          status: TEST_STATUS_HEALTHY,
        },
        tenants: {
          status: TEST_STATUS_HEALTHY,
        },
      }
      const response = createHttpResponse(createSuccessResponse(metrics))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getSystemMetrics()

      expect(result.application.version).toBe(TEST_PRODUCT_NAME)
    })
  })

  describe('admin API - analytics', () => {
    it('should get system stats successfully', async () => {
      const stats = {
        stats: {
          active_licenses: TEST_NUMBER_TEN,
          expired_licenses: TEST_NUMBER_ZERO,
          total_customers: TEST_NUMBER_TEN,
          total_activations: TEST_NUMBER_TEN,
        },
      }
      const response = createHttpResponse(createSuccessResponse(stats))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getSystemStats()

      expect(result.stats).toBeDefined()
    })

    it('should get usage summaries successfully', async () => {
      const summaries = {
        summaries: [
          {
            id: TEST_NUMBER_ONE,
            tenantId: null,
            licenseId: TEST_NUMBER_ONE,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
            totalActivations: TEST_NUMBER_ONE,
            totalValidations: TEST_NUMBER_ONE,
            totalUsageReports: TEST_NUMBER_ONE,
            uniqueDomains: TEST_NUMBER_ONE,
            uniqueIPs: TEST_NUMBER_ONE,
            peakConcurrency: TEST_NUMBER_ONE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }
      const response = createHttpResponse(createSuccessResponse(summaries))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getUsageSummaries()

      expect(result.summaries).toBeDefined()
    })

    it('should get usage trends successfully', async () => {
      const trends = {
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString(),
        groupBy: 'day',
        trends: [
          {
            period: new Date().toISOString(),
            totalActivations: TEST_NUMBER_ONE,
            totalValidations: TEST_NUMBER_ONE,
            totalUsageReports: TEST_NUMBER_ONE,
            uniqueDomains: TEST_NUMBER_ONE,
            uniqueIPs: TEST_NUMBER_ONE,
            peakConcurrency: TEST_NUMBER_ONE,
          },
        ],
      }
      const response = createHttpResponse(createSuccessResponse(trends))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getUsageTrends()

      expect(result.trends).toBeDefined()
    })

    it('should get audit logs successfully', async () => {
      const logs = [
        {
          id: '1',
          adminId: TEST_USER_ID,
          adminUsername: TEST_USERNAME,
          vendorId: TEST_TENANT_ID,
          action: 'UPDATE',
          resourceType: 'LICENSE',
          resourceId: TEST_LICENSE_KEY,
          details: { field: 'status' },
          ipAddress: TEST_DOMAIN,
          userAgent: 'vitest',
          accessMethod: 'UI_API',
          unixUser: null,
          createdAt: new Date().toISOString(),
        },
      ]
      const response = createHttpResponse(createSuccessResponse({ logs, total: logs.length }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getAuditLogs({
        adminId: TEST_USER_ID,
        action: 'UPDATE',
        resourceType: 'LICENSE',
        resourceId: TEST_LICENSE_KEY,
        limit: TEST_NUMBER_TEN,
        offset: TEST_NUMBER_ZERO,
      })

      expect(result.logs).toHaveLength(logs.length)
    })

    it('should verify audit chain successfully', async () => {
      const verification = {
        valid: TEST_BOOLEAN_TRUE,
        totalEntries: TEST_NUMBER_TEN,
        verifiedEntries: TEST_NUMBER_TEN,
        brokenLinks: [],
      }
      const response = createHttpResponse(createSuccessResponse(verification))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.verifyAuditChain({ fromId: '1', toId: '100' })

      expect(result.valid).toBe(TEST_BOOLEAN_TRUE)
    })

    it('should get audit logs without filters', async () => {
      const response = createHttpResponse(createSuccessResponse({ logs: [], total: TEST_NUMBER_ZERO }))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.getAuditLogs()

      expect(result.total).toBe(TEST_NUMBER_ZERO)
    })

    it('should verify audit chain without params', async () => {
      const verification = {
        valid: TEST_BOOLEAN_TRUE,
        totalEntries: TEST_NUMBER_ZERO,
        verifiedEntries: TEST_NUMBER_ZERO,
        brokenLinks: [],
      }
      const response = createHttpResponse(createSuccessResponse(verification))

      vi.mocked(mockHttpClient.get).mockResolvedValue(response)

      const result = await client.verifyAuditChain()

      expect(result.verifiedEntries).toBe(TEST_NUMBER_ZERO)
    })
  })

  describe('error handling - parseResponse edge cases', () => {
    it('should handle non-object response in handleApiResponse', async () => {
      const invalidResponse = createHttpResponse(null as unknown as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(invalidResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle invalid object response format', async () => {
      const invalidResponse = createHttpResponse({ invalid: 'format' } as unknown as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(invalidResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })
  })

  describe('error handling - parseErrorDetails edge cases', () => {
    it('should handle error with field in details', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'ERROR',
          message: 'Error message',
          details: {
            field: 'email',
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle error with resourceType in details', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'ERROR',
          message: 'Error message',
          details: {
            resourceType: 'License',
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle error with validation errors including type and context', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            validationErrors: [
              {
                path: ['field'],
                message: 'Invalid value',
                type: 'string',
                context: { min: TEST_NUMBER_TEN, max: TEST_NUMBER_HUNDRED },
              },
            ],
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle error with validation errors without type or context', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            validationErrors: [
              {
                path: ['field'],
                message: 'Invalid value',
              },
            ],
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle error details that return undefined when empty', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'ERROR',
          message: 'Error message',
          details: {},
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle error with validationErrors array that has valid errors (covers line 705)', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            validationErrors: [
              {
                path: ['email'],
                message: 'Email is required',
              },
              {
                path: ['password'],
                message: 'Password must be at least 8 characters',
              },
            ],
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle validationErrors array with invalid errors that get filtered out (covers lines 686-691 false branches)', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            validationErrors: [
              {
                path: ['email'],
                message: 'Email is required',
              },
              {
                // Missing required 'message' field - should be filtered out (covers line 690 false branch)
                path: ['password'],
              },
              {
                // Missing 'path' field - should be filtered out (covers line 689 false branch)
                message: 'Some message',
              },
              {
                // message is not a string - should be filtered out (covers line 690 false branch)
                path: ['field'],
                message: TEST_NUMBER_ZERO,
              },
              null, // Should be filtered out (covers line 687 false branch - not an object)
              'string-error', // Should be filtered out (covers line 687 false branch - not an object)
            ],
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle validationErrors array that becomes empty after filtering (covers line 705 false branch)', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            validationErrors: [
              {
                // Missing required fields - all should be filtered out
                path: ['password'],
                // Missing 'message' field
              },
              null, // Should be filtered out
              'string-error', // Should be filtered out
            ],
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle error with additional string/number/boolean properties (covers line 713)', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'ERROR',
          message: 'Error message',
          details: {
            customStringProp: 'custom value',
            customNumberProp: TEST_NUMBER_TEN,
            customBooleanProp: TEST_BOOLEAN_TRUE,
            customNullProp: null,
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow()
    })

    it('should handle error response with parsed.error present (covers lines 727-729)', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'CUSTOM_ERROR',
          message: 'Custom error message',
          details: {
            customDetail: 'value',
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      try {
        await client.getLicenseData(TEST_LICENSE_KEY)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException)
        expect((error as ApiException).errorCode).toBe('CUSTOM_ERROR')
        expect((error as ApiException).message).toBe('Custom error message')
        expect((error as ApiException).errorDetails).toBeDefined()
      }
    })

    it('should handle error response with parsed.error null/undefined (covers lines 727-729 branches)', async () => {
      // Test when parsed.error is undefined (covers || 'UNKNOWN_ERROR' and || 'API request failed' branches)
      const errorResponse = createHttpResponse({
        success: false,
        // No error field - parsed.error will be undefined
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      try {
        await client.getLicenseData(TEST_LICENSE_KEY)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException)
        expect((error as ApiException).errorCode).toBe('UNKNOWN_ERROR')
        expect((error as ApiException).message).toBe('API request failed')
      }
    })
  })

  describe('error handling - handleError default case', () => {
    it('should throw ApiException for unknown error codes', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'UNKNOWN_ERROR_CODE',
          message: 'Some unknown error',
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow(ApiException)
    })

    it('should throw ApiException with error details for unknown error codes', async () => {
      const errorResponse = createHttpResponse({
        success: false,
        error: {
          code: 'CUSTOM_ERROR',
          message: 'Custom error message',
          details: {
            customDetail: 'value',
          },
        },
      } as ApiResponse)

      vi.mocked(mockHttpClient.get).mockResolvedValue(errorResponse)

      await expect(client.getLicenseData(TEST_LICENSE_KEY)).rejects.toThrow(ApiException)
    })
  })
})
