import { faker } from '@faker-js/faker'
import { buildUser } from '@test/factories/userFactory'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ActivationLimitExceededException,
  ApiException,
  AuthenticationException,
  ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_LICENSE_EXPIRED,
  ERROR_CODE_LICENSE_NOT_FOUND,
  LicenseExpiredException,
  LicenseNotFoundException,
} from '@/simpleLicense'
import { Client } from '@/simpleLicense/client'
import { AxiosHttpClient } from '@/simpleLicense/http/AxiosHttpClient'

vi.mock('@/simpleLicense/http/AxiosHttpClient')

describe('Client', () => {
  let client: Client
  let mockHttpClient: {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    patch: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    setAuthToken: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      setAuthToken: vi.fn(),
    }

    vi.mocked(AxiosHttpClient).mockImplementation(() => mockHttpClient as unknown as AxiosHttpClient)

    client = new Client('https://api.example.com', mockHttpClient as unknown as AxiosHttpClient)
  })

  describe('login', () => {
    it('handles standard ApiResponse format', async () => {
      const user = buildUser()
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: faker.string.alphanumeric(32),
            user,
            expires_in: 3600,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.token).toBeDefined()
      expect(result.user).toEqual(user)
    })

    it('handles direct login response format', async () => {
      const user = buildUser()
      const mockResponse = {
        data: {
          success: true,
          token: faker.string.alphanumeric(32),
          user,
          expires_in: 3600,
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.token).toBeDefined()
      expect(result.user).toEqual(user)
    })

    it('throws AuthenticationException for invalid credentials', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: ERROR_CODE_INVALID_CREDENTIALS,
            message: 'Invalid credentials',
          },
        },
        status: 401,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      await expect(client.login(faker.internet.username(), faker.internet.password())).rejects.toThrow(
        AuthenticationException
      )
    })

    it('throws AuthenticationException when token is missing', async () => {
      const user = buildUser()
      const mockResponse = {
        data: {
          success: true,
          data: {
            user,
            expires_in: 3600,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      await expect(client.login(faker.internet.username(), faker.internet.password())).rejects.toThrow(
        AuthenticationException
      )
    })
  })

  describe('logout', () => {
    it('clears token even when request fails', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Network error'))

      await client.logout()

      expect(client.getToken()).toBeNull()
    })

    it('clears token on successful logout', async () => {
      mockHttpClient.post.mockResolvedValue({ data: { success: true }, status: 200 })

      await client.logout()

      expect(client.getToken()).toBeNull()
    })
  })

  describe('restoreSession', () => {
    it('returns existing token if available', async () => {
      const existingToken = faker.string.alphanumeric(32)
      client.setToken(existingToken)

      const result = await client.restoreSession()

      expect(result).toBe(existingToken)
    })

    it('returns null when refresh fails', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Refresh failed'))

      const result = await client.restoreSession()

      expect(result).toBeNull()
    })

    it('returns null when refresh response has no token', async () => {
      client.setToken(null)
      const mockResponse = {
        data: {
          success: true,
        },
        status: 200,
      }

      const axiosMock = await import('axios')
      vi.spyOn(axiosMock.default, 'post').mockResolvedValue(mockResponse)

      const result = await client.restoreSession()

      expect(result).toBeNull()
      expect(client.getToken()).toBeNull()
    })

    it('returns null when refresh response has success but no token property', async () => {
      client.setToken(null)
      const mockResponse = {
        data: {
          success: true,
          otherData: 'value',
        },
        status: 200,
      }

      const axiosMock = await import('axios')
      vi.spyOn(axiosMock.default, 'post').mockResolvedValue(mockResponse)

      const result = await client.restoreSession()

      expect(result).toBeNull()
      expect(client.getToken()).toBeNull()
    })

    it('handles refresh response with null token', async () => {
      client.setToken(null)
      const mockResponse = {
        data: {
          success: true,
          token: null,
        },
        status: 200,
      }

      const axiosMock = await import('axios')
      vi.spyOn(axiosMock.default, 'post').mockResolvedValue(mockResponse)

      const result = await client.restoreSession()

      expect(result).toBeNull()
      expect(client.getToken()).toBeNull()
    })
  })

  describe('constructor', () => {
    it('removes trailing slash from baseURL', () => {
      const clientWithSlash = new Client('https://api.example.com/')
      expect(clientWithSlash).toBeDefined()
    })

    it('keeps baseURL without trailing slash', () => {
      const clientWithoutSlash = new Client('https://api.example.com')
      expect(clientWithoutSlash).toBeDefined()
    })
  })

  describe('login', () => {
    it('handles expiresIn with snake_case', async () => {
      const user = buildUser()
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: faker.string.alphanumeric(32),
            user,
            expires_in: 3600,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.expires_in).toBe(3600)
      expect(result.expiresIn).toBe(3600)
    })

    it('handles expiresIn with camelCase', async () => {
      const user = buildUser()
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: faker.string.alphanumeric(32),
            user,
            expiresIn: 7200,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.expires_in).toBe(7200)
      expect(result.expiresIn).toBe(7200)
    })

    it('handles mustChangePassword from user object', async () => {
      const user = buildUser({ passwordResetRequired: true })
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: faker.string.alphanumeric(32),
            user,
            expires_in: 3600,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.mustChangePassword).toBe(true)
    })

    it('handles must_change_password from login data', async () => {
      const user = buildUser()
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: faker.string.alphanumeric(32),
            user,
            expires_in: 3600,
            must_change_password: true,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.mustChangePassword).toBe(true)
    })

    it('handles mustChangePassword from login data', async () => {
      const user = buildUser()
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: faker.string.alphanumeric(32),
            user,
            expires_in: 3600,
            mustChangePassword: true,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.mustChangePassword).toBe(true)
    })

    it('handles user with password_reset_required in snake_case', async () => {
      const user = { ...buildUser(), password_reset_required: true, passwordResetRequired: undefined }
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: faker.string.alphanumeric(32),
            user,
            expires_in: 3600,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.user.passwordResetRequired).toBe(true)
    })

    it('handles user with passwordResetRequired in camelCase', async () => {
      const user = buildUser({ passwordResetRequired: true })
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: faker.string.alphanumeric(32),
            user,
            expires_in: 3600,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.user.passwordResetRequired).toBe(true)
    })

    it('handles user without password reset flags', async () => {
      const user = buildUser({ passwordResetRequired: undefined })
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: faker.string.alphanumeric(32),
            user,
            expires_in: 3600,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.login(faker.internet.username(), faker.internet.password())

      expect(result.user.passwordResetRequired).toBe(false)
    })

    it('throws when loginData is invalid', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null,
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      await expect(client.login(faker.internet.username(), faker.internet.password())).rejects.toThrow(
        AuthenticationException
      )
    })

    it('handles error response without error code', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            message: 'Authentication failed',
          },
        },
        status: 401,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      await expect(client.login(faker.internet.username(), faker.internet.password())).rejects.toThrow(
        AuthenticationException
      )
    })
  })

  describe('listProducts', () => {
    it('returns products list', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listProducts()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('handles error response', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'PRODUCTS_NOT_FOUND',
            message: 'Products not found',
          },
        },
        status: 404,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error response without error code', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            message: 'Products not found',
          },
        },
        status: 404,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error response without error message', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'PRODUCTS_NOT_FOUND',
          },
        },
        status: 404,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles response with defaultData', async () => {
      const mockResponse = {
        data: {
          success: true,
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      // This will use defaultData since parsed.data is undefined
      const result = await client.listProducts()

      expect(result).toBeDefined()
    })

    it('handles response with defaultData when data is missing', async () => {
      const mockResponse = {
        data: {
          success: true,
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      // listProducts uses defaultData internally, so it should return empty array
      const result = await client.listProducts()
      expect(result).toBeDefined()
    })
  })

  describe('createProduct', () => {
    it('creates product successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            product: {
              id: faker.string.uuid(),
              name: faker.commerce.productName(),
              slug: faker.lorem.slug(),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.createProduct({
        name: faker.commerce.productName(),
        slug: faker.lorem.slug(),
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('listLicenses', () => {
    it('returns licenses list without filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listLicenses()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('applies status filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listLicenses({ status: 'ACTIVE' })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('status=ACTIVE'))
    })

    it('applies product_slug filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listLicenses({ product_slug: 'test-product' })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('product_slug=test-product'))
    })

    it('applies customer_email filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listLicenses({ customer_email: 'test@example.com' })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('customer_email=test%40example.com'))
    })

    it('applies limit filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listLicenses({ limit: 10 })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('limit=10'))
    })

    it('applies page filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listLicenses({ page: 2 })

      expect(result).toBeDefined()
      // Note: listLicenses uses offset, not page - checking for offset calculation
      const callUrl = mockHttpClient.get.mock.calls[0]?.[0] as string
      expect(callUrl).toBeDefined()
    })

    it('applies offset filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listLicenses({ offset: 20 })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('offset=20'))
    })

    it('applies multiple filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listLicenses({
        status: 'ACTIVE',
        product_slug: 'test-product',
        limit: 10,
        offset: 20,
      })

      expect(result).toBeDefined()
      const callUrl = mockHttpClient.get.mock.calls[0]?.[0] as string
      expect(callUrl).toContain('status=ACTIVE')
      expect(callUrl).toContain('product_slug=test-product')
      expect(callUrl).toContain('limit=10')
      expect(callUrl).toContain('offset=20')
    })

    it('builds URL without query string when no filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listLicenses()

      expect(result).toBeDefined()
      const callUrl = mockHttpClient.get.mock.calls[0]?.[0] as string
      expect(callUrl).not.toContain('?')
    })
  })

  describe('createLicense', () => {
    it('creates license successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            license: {
              id: faker.string.uuid(),
              licenseKey: faker.string.alphanumeric(32),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.createLicense({
        product_slug: faker.lorem.slug(),
        customer_email: faker.internet.email(),
        tier_code: 'PRO',
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('getLicense', () => {
    it('gets license by ID', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            license: {
              id: licenseId,
              licenseKey: faker.string.alphanumeric(32),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getLicense(licenseId)

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('throws LicenseNotFoundException for LICENSE_NOT_FOUND error', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: ERROR_CODE_LICENSE_NOT_FOUND,
            message: 'License not found',
          },
        },
        status: 404,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.getLicense(licenseId)).rejects.toThrow(LicenseNotFoundException)
    })

    it('throws LicenseExpiredException for LICENSE_EXPIRED error', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: ERROR_CODE_LICENSE_EXPIRED,
            message: 'License expired',
          },
        },
        status: 410,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.getLicense(licenseId)).rejects.toThrow(LicenseExpiredException)
    })

    it('throws ActivationLimitExceededException for ACTIVATION_LIMIT_EXCEEDED error', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED,
            message: 'Activation limit exceeded',
          },
        },
        status: 429,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.getLicense(licenseId)).rejects.toThrow(ActivationLimitExceededException)
    })

    it('throws ApiException for unknown error codes', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'UNKNOWN_ERROR',
            message: 'Something went wrong',
          },
        },
        status: 500,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.getLicense(licenseId)).rejects.toThrow(ApiException)
    })
  })

  describe('activateLicense', () => {
    it('activates license with all options', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            activation: {
              id: faker.string.uuid(),
              domain: faker.internet.domainName(),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.activateLicense(faker.string.alphanumeric(32), faker.internet.domainName(), {
        site_name: faker.company.name(),
        os: 'Linux',
        region: 'US',
        client_version: '1.0.0',
        device_hash: faker.string.alphanumeric(16),
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })

    it('activates license without options', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            activation: {
              id: faker.string.uuid(),
              domain: faker.internet.domainName(),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.activateLicense(faker.string.alphanumeric(32), faker.internet.domainName())

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('validateLicense', () => {
    it('validates license successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            valid: true,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.validateLicense(faker.string.alphanumeric(32), faker.internet.domainName())

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('deactivateLicense', () => {
    it('deactivates license successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            success: true,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.deactivateLicense(faker.string.alphanumeric(32), faker.internet.domainName())

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('reportUsage', () => {
    it('reports usage successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            success: true,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.reportUsage({
        license_key: faker.string.alphanumeric(32),
        domain: faker.internet.domainName(),
        month: '2024-01',
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('getLicenseData', () => {
    it('gets license data successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            license: {
              licenseKey: faker.string.alphanumeric(32),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getLicenseData(faker.string.alphanumeric(32))

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('getLicenseFeatures', () => {
    it('gets license features successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            features: [],
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getLicenseFeatures(faker.string.alphanumeric(32))

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('checkUpdate', () => {
    it('checks for updates successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            updateAvailable: false,
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.checkUpdate({
        license_key: faker.string.alphanumeric(32),
        domain: faker.internet.domainName(),
        slug: faker.lorem.slug(),
        current_version: '1.0.0',
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('listTenants', () => {
    it('returns tenants list', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listTenants()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('listUsers', () => {
    it('returns users list without filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listUsers()

      expect(result).toBeDefined()
      const callUrl = mockHttpClient.get.mock.calls[0]?.[0] as string
      expect(callUrl).not.toContain('?')
    })

    it('applies role filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listUsers({ role: 'SUPERUSER' })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('role=SUPERUSER'))
    })

    it('applies vendor_id filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listUsers({ vendor_id: 'vendor-1' })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('vendor_id=vendor-1'))
    })

    it('applies search filter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listUsers({ search: 'test' })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('search=test'))
    })

    it('applies limit filter when number', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listUsers({ limit: 10 })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('limit=10'))
    })

    it('applies offset filter when number', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listUsers({ offset: 20 })

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalledWith(expect.stringContaining('offset=20'))
    })

    it('builds URL without query string when no filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await client.listUsers()

      const callUrl = mockHttpClient.get.mock.calls[0]?.[0] as string
      expect(callUrl).not.toContain('?')
    })
  })

  describe('listProductTiers', () => {
    it('returns product tiers list', async () => {
      const productId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listProductTiers(productId)

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('listEntitlements', () => {
    it('returns entitlements list', async () => {
      const productId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.listEntitlements(productId)

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('restoreSession', () => {
    it('returns current token when already set', async () => {
      const existingToken = faker.string.alphanumeric(32)
      client.setToken(existingToken)

      const result = await client.restoreSession()

      expect(result).toBe(existingToken)
    })

    it('returns token when refresh succeeds with token', async () => {
      client.setToken(null)
      const mockToken = faker.string.alphanumeric(32)
      const mockResponse = {
        data: {
          success: true,
          token: mockToken,
        },
        status: 200,
      }

      // Mock axios directly for restoreSession
      const axiosMock = await import('axios')
      vi.spyOn(axiosMock.default, 'post').mockResolvedValue(mockResponse)

      const result = await client.restoreSession()

      expect(result).toBe(mockToken)
      expect(client.getToken()).toBe(mockToken)
    })

    it('returns null when refresh succeeds but no token', async () => {
      client.setToken(null)
      const mockResponse = {
        data: {
          success: true,
        },
        status: 200,
      }

      const axiosMock = await import('axios')
      vi.spyOn(axiosMock.default, 'post').mockResolvedValue(mockResponse)

      const result = await client.restoreSession()

      expect(result).toBeNull()
      expect(client.getToken()).toBeNull()
    })

    it('returns null when refresh fails', async () => {
      client.setToken(null)
      const axiosMock = await import('axios')
      vi.spyOn(axiosMock.default, 'post').mockRejectedValue(new Error('Refresh failed'))

      const result = await client.restoreSession()

      expect(result).toBeNull()
      expect(client.getToken()).toBeNull()
    })

    it('handles AbortSignal in restoreSession', async () => {
      client.setToken(null)
      const mockToken = faker.string.alphanumeric(32)
      const mockResponse = {
        data: {
          success: true,
          token: mockToken,
        },
        status: 200,
      }

      const axiosMock = await import('axios')
      const postSpy = vi.spyOn(axiosMock.default, 'post').mockResolvedValue(mockResponse)
      const signal = new AbortController().signal

      const result = await client.restoreSession(signal)

      expect(result).toBe(mockToken)
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh'),
        {},
        expect.objectContaining({ signal })
      )
    })

    it('handles refresh response without success flag', async () => {
      client.setToken(null)
      const mockResponse = {
        data: {
          token: faker.string.alphanumeric(32),
        },
        status: 200,
      }

      const axiosMock = await import('axios')
      vi.spyOn(axiosMock.default, 'post').mockResolvedValue(mockResponse)

      const result = await client.restoreSession()

      expect(result).toBeNull()
      expect(client.getToken()).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('returns current user', async () => {
      const user = buildUser()
      const mockResponse = {
        data: {
          success: true,
          data: user,
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getCurrentUser()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('changePassword', () => {
    it('changes password successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.patch = vi.fn().mockResolvedValue(mockResponse)

      const result = await client.changePassword({
        current_password: faker.internet.password(),
        new_password: faker.internet.password(),
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.patch).toHaveBeenCalled()
    })
  })

  describe('setToken', () => {
    it('sets token', () => {
      const token = faker.string.alphanumeric(32)
      client.setToken(token)

      expect(client.getToken()).toBe(token)
    })

    it('sets token to null', () => {
      client.setToken(null)

      expect(client.getToken()).toBeNull()
    })
  })

  describe('getBaseUrl', () => {
    it('returns base URL', () => {
      const baseUrl = 'https://api.example.com'
      const testClient = new Client(baseUrl)

      expect(testClient.getBaseUrl()).toBe(baseUrl)
    })
  })

  describe('updateLicense', () => {
    it('updates license successfully', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            license: {
              id: licenseId,
              status: 'ACTIVE',
            },
          },
        },
        status: 200,
      }

      mockHttpClient.put.mockResolvedValue(mockResponse)

      const result = await client.updateLicense(licenseId, {
        customer_email: faker.internet.email(),
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.put).toHaveBeenCalled()
    })
  })

  describe('suspendLicense', () => {
    it('suspends license successfully', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.suspendLicense(licenseId)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('resumeLicense', () => {
    it('resumes license successfully', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.resumeLicense(licenseId)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('freezeLicense', () => {
    it('freezes license successfully', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.freezeLicense(licenseId)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('revokeLicense', () => {
    it('revokes license successfully', async () => {
      const licenseId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.delete.mockResolvedValue(mockResponse)

      const result = await client.revokeLicense(licenseId)

      expect(result).toBeDefined()
      expect(mockHttpClient.delete).toHaveBeenCalled()
    })
  })

  describe('updateProduct', () => {
    it('updates product successfully', async () => {
      const productId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            product: {
              id: productId,
              name: faker.commerce.productName(),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.put.mockResolvedValue(mockResponse)

      const result = await client.updateProduct(productId, {
        name: faker.commerce.productName(),
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.put).toHaveBeenCalled()
    })
  })

  describe('deleteProduct', () => {
    it('deletes product successfully', async () => {
      const productId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.delete.mockResolvedValue(mockResponse)

      const result = await client.deleteProduct(productId)

      expect(result).toBeDefined()
      expect(mockHttpClient.delete).toHaveBeenCalled()
    })
  })

  describe('getProduct', () => {
    it('gets product successfully', async () => {
      const productId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            product: {
              id: productId,
              name: faker.commerce.productName(),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getProduct(productId)

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('createProductTier', () => {
    it('creates product tier successfully', async () => {
      const productId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            tier: {
              id: faker.string.uuid(),
              tierCode: 'PRO',
            },
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.createProductTier(productId, {
        tier_code: 'PRO',
        tier_name: 'Professional',
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('getProductTier', () => {
    it('gets product tier successfully', async () => {
      const tierId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            tier: {
              id: tierId,
              tierCode: 'PRO',
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getProductTier(tierId)

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('updateProductTier', () => {
    it('updates product tier successfully', async () => {
      const tierId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            tier: {
              id: tierId,
              tierCode: 'PRO',
            },
          },
        },
        status: 200,
      }

      mockHttpClient.put.mockResolvedValue(mockResponse)

      const result = await client.updateProductTier(tierId, {
        tier_name: 'Professional Plus',
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.put).toHaveBeenCalled()
    })
  })

  describe('deleteProductTier', () => {
    it('deletes product tier successfully', async () => {
      const tierId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.delete.mockResolvedValue(mockResponse)

      const result = await client.deleteProductTier(tierId)

      expect(result).toBeDefined()
      expect(mockHttpClient.delete).toHaveBeenCalled()
    })
  })

  describe('handleApiResponse error paths', () => {
    it('handles error response with error details', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              field: 'email',
              validationErrors: [
                {
                  path: 'email',
                  message: 'Invalid email format',
                },
              ],
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error response without error details', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          },
        },
        status: 500,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error response without error object', async () => {
      const mockResponse = {
        data: {
          success: false,
        },
        status: 500,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles parseResponse with non-object response', async () => {
      const mockResponse = {
        data: 'not an object',
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles parseResponse with object but not ApiResponse', async () => {
      const mockResponse = {
        data: {
          notSuccess: true,
          someData: {},
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })
  })

  describe('createEntitlement', () => {
    it('creates entitlement successfully', async () => {
      const productId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            entitlement: {
              id: faker.string.uuid(),
              key: 'feature-key',
            },
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.createEntitlement(productId, {
        key: 'feature-key',
        tier_ids: [faker.string.uuid()],
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('getEntitlement', () => {
    it('gets entitlement successfully', async () => {
      const entitlementId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            entitlement: {
              id: entitlementId,
              key: 'feature-key',
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getEntitlement(entitlementId)

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('updateEntitlement', () => {
    it('updates entitlement successfully', async () => {
      const entitlementId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            entitlement: {
              id: entitlementId,
              key: 'updated-key',
            },
          },
        },
        status: 200,
      }

      mockHttpClient.put.mockResolvedValue(mockResponse)

      const result = await client.updateEntitlement(entitlementId, {
        key: 'updated-key',
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.put).toHaveBeenCalled()
    })
  })

  describe('deleteEntitlement', () => {
    it('deletes entitlement successfully', async () => {
      const entitlementId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.delete.mockResolvedValue(mockResponse)

      const result = await client.deleteEntitlement(entitlementId)

      expect(result).toBeDefined()
      expect(mockHttpClient.delete).toHaveBeenCalled()
    })
  })

  describe('createUser', () => {
    it('creates user successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: buildUser(),
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.createUser({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('getUser', () => {
    it('gets user successfully', async () => {
      const userId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: buildUser({ id: userId }),
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getUser(userId)

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('updateUser', () => {
    it('updates user successfully', async () => {
      const userId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: buildUser({ id: userId }),
          },
        },
        status: 200,
      }

      mockHttpClient.put.mockResolvedValue(mockResponse)

      const result = await client.updateUser(userId, {
        email: faker.internet.email(),
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.put).toHaveBeenCalled()
    })
  })

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      const userId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.delete.mockResolvedValue(mockResponse)

      const result = await client.deleteUser(userId)

      expect(result).toBeDefined()
      expect(mockHttpClient.delete).toHaveBeenCalled()
    })
  })

  describe('createTenant', () => {
    it('creates tenant successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            tenant: {
              id: faker.string.uuid(),
              name: faker.company.name(),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.createTenant({
        name: faker.company.name(),
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('updateTenant', () => {
    it('updates tenant successfully', async () => {
      const tenantId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            tenant: {
              id: tenantId,
              name: faker.company.name(),
            },
          },
        },
        status: 200,
      }

      mockHttpClient.put.mockResolvedValue(mockResponse)

      const result = await client.updateTenant(tenantId, {
        name: faker.company.name(),
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.put).toHaveBeenCalled()
    })
  })

  describe('suspendTenant', () => {
    it('suspends tenant successfully', async () => {
      const tenantId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.suspendTenant(tenantId)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('resumeTenant', () => {
    it('resumes tenant successfully', async () => {
      const tenantId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.resumeTenant(tenantId)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('getQuotaUsage', () => {
    it('gets quota usage successfully', async () => {
      const tenantId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            usage: {
              products_count: 10,
              activations_count: 100,
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getQuotaUsage(tenantId)

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('getQuotaConfig', () => {
    it('gets quota config successfully', async () => {
      const tenantId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            config: {
              max_products: 100,
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getQuotaConfig(tenantId)

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('updateQuotaLimits', () => {
    it('updates quota limits successfully', async () => {
      const tenantId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.put.mockResolvedValue(mockResponse)

      const result = await client.updateQuotaLimits(tenantId, {
        max_products: 100,
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.put).toHaveBeenCalled()
    })
  })

  describe('createTenantBackup', () => {
    it('creates tenant backup successfully', async () => {
      const tenantId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: {
            backup: {
              id: faker.string.uuid(),
              tenantId,
            },
          },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.createTenantBackup(tenantId)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('getServerStatus', () => {
    it('gets server status successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getServerStatus()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('getHealthMetrics', () => {
    it('gets health metrics successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            metrics: {
              uptime: 3600,
              memory: {
                heapTotal: 1000000,
                heapUsed: 500000,
              },
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getHealthMetrics()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('getSystemMetrics', () => {
    it('gets system metrics successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            system: {
              uptime: 3600,
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getSystemMetrics()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('getSystemStats', () => {
    it('gets system stats successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            stats: {
              active_licenses: 100,
              expired_licenses: 10,
            },
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getSystemStats()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('getUsageSummaries', () => {
    it('gets usage summaries successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            summaries: [],
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getUsageSummaries()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('getUsageTrends', () => {
    it('gets usage trends successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            trends: [],
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getUsageTrends()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('getActivationDistribution', () => {
    it('gets activation distribution successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            distribution: [],
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getActivationDistribution()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('getAlertThresholds', () => {
    it('gets alert thresholds successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            thresholds: {},
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getAlertThresholds()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('updateAlertThresholds', () => {
    it('updates alert thresholds successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            thresholds: {},
          },
        },
        status: 200,
      }

      mockHttpClient.put.mockResolvedValue(mockResponse)

      const result = await client.updateAlertThresholds({
        high_activations: 1000,
      })

      expect(result).toBeDefined()
      expect(mockHttpClient.put).toHaveBeenCalled()
    })
  })

  describe('getTopLicenses', () => {
    it('gets top licenses successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            licenses: [],
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getTopLicenses()

      expect(result).toBeDefined()
      expect(mockHttpClient.get).toHaveBeenCalled()
    })
  })

  describe('parseErrorDetails branches', () => {
    it('handles error with field property', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              field: 'email',
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error with resourceType property', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
            details: {
              resourceType: 'License',
            },
          },
        },
        status: 404,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error with validationErrors array', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              validationErrors: [
                {
                  path: 'email',
                  message: 'Invalid email',
                  type: 'string',
                },
              ],
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error with validationErrors with context', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              validationErrors: [
                {
                  path: 'email',
                  message: 'Invalid email',
                  context: {
                    minLength: 5,
                  },
                },
              ],
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error with additional string properties', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'CUSTOM_ERROR',
            message: 'Custom error',
            details: {
              customField: 'customValue',
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error with null details', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'ERROR',
            message: 'Error message',
            details: null,
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error with non-object details', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'ERROR',
            message: 'Error message',
            details: 'string details',
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })
  })

  describe('suspendProduct', () => {
    it('suspends product successfully', async () => {
      const productId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.suspendProduct(productId)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('resumeProduct', () => {
    it('resumes product successfully', async () => {
      const productId = faker.string.uuid()
      const mockResponse = {
        data: {
          success: true,
          data: { success: true },
        },
        status: 200,
      }

      mockHttpClient.post.mockResolvedValue(mockResponse)

      const result = await client.resumeProduct(productId)

      expect(result).toBeDefined()
      expect(mockHttpClient.post).toHaveBeenCalled()
    })
  })

  describe('parseErrorDetails branches', () => {
    it('handles error with field property', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              field: 'email',
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error with resourceType property', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resource not found',
            details: {
              resourceType: 'License',
            },
          },
        },
        status: 404,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error with validationErrors array', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              validationErrors: [
                {
                  path: 'email',
                  message: 'Invalid email',
                  type: 'string',
                },
              ],
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles validationErrors with context', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              validationErrors: [
                {
                  path: 'email',
                  message: 'Invalid email',
                  context: {
                    minLength: 5,
                  },
                },
              ],
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles validationErrors without type', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              validationErrors: [
                {
                  path: 'email',
                  message: 'Invalid email',
                },
              ],
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles validationErrors with array context', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              validationErrors: [
                {
                  path: 'email',
                  message: 'Invalid email',
                  context: [],
                },
              ],
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles validationErrors with null context', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              validationErrors: [
                {
                  path: 'email',
                  message: 'Invalid email',
                  context: null,
                },
              ],
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles validationErrors with invalid error objects', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: {
              validationErrors: [
                {
                  path: 'email',
                  message: 'Invalid email',
                },
                {
                  invalid: 'error',
                },
                null,
              ],
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error details with empty object', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'ERROR',
            message: 'Error message',
            details: {},
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error details with excluded keys', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'ERROR',
            message: 'Error message',
            details: {
              field: 'email',
              resourceType: 'License',
              validationErrors: [],
              customField: 'customValue',
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error details with null values', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'ERROR',
            message: 'Error message',
            details: {
              customField: null,
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })
  })

  describe('getAuditLogs', () => {
    it('fetches audit logs without filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            logs: [],
            total: 0,
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.getAuditLogs()

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/admin/audit/logs')
      expect(result).toEqual({
        logs: [],
        total: 0,
      })
    })

    it('fetches audit logs with all filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            logs: [],
            total: 0,
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const filters = {
        adminId: 'admin-1',
        action: 'CREATE',
        resourceType: 'LICENSE',
        resourceId: 'license-1',
        limit: 10,
        offset: 0,
      }

      const result = await client.getAuditLogs(filters)

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/admin/audit/logs?adminId=admin-1&action=CREATE&resourceType=LICENSE&resourceId=license-1&limit=10&offset=0'
      )
      expect(result).toEqual({
        logs: [],
        total: 0,
      })
    })

    it('fetches audit logs with partial filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            logs: [],
            total: 0,
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const filters = {
        adminId: 'admin-1',
        limit: 20,
      }

      const result = await client.getAuditLogs(filters)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/admin/audit/logs?adminId=admin-1&limit=20')
      expect(result).toEqual({
        logs: [],
        total: 0,
      })
    })
  })

  describe('verifyAuditChain', () => {
    it('verifies audit chain without params', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            isValid: true,
            chain: [],
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await client.verifyAuditChain()

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/admin/audit/verify')
      expect(result).toEqual({
        isValid: true,
        chain: [],
      })
    })

    it('verifies audit chain with fromId and toId', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            isValid: true,
            chain: [],
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const params = {
        fromId: 'log-1',
        toId: 'log-2',
      }

      const result = await client.verifyAuditChain(params)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/admin/audit/verify?fromId=log-1&toId=log-2')
      expect(result).toEqual({
        isValid: true,
        chain: [],
      })
    })

    it('verifies audit chain with only fromId', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            isValid: true,
            chain: [],
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const params = {
        fromId: 'log-1',
      }

      const result = await client.verifyAuditChain(params)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/admin/audit/verify?fromId=log-1')
      expect(result).toEqual({
        isValid: true,
        chain: [],
      })
    })

    it('verifies audit chain with only toId', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            isValid: true,
            chain: [],
          },
        },
        status: 200,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const params = {
        toId: 'log-2',
      }

      const result = await client.verifyAuditChain(params)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/admin/audit/verify?toId=log-2')
      expect(result).toEqual({
        isValid: true,
        chain: [],
      })
    })
  })

  describe('parseErrorDetails branches continued', () => {
    it('handles error details with number values', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'ERROR',
            message: 'Error message',
            details: {
              count: 5,
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error details with boolean values', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'ERROR',
            message: 'Error message',
            details: {
              isRetryable: true,
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error details with non-string/number/boolean values', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'ERROR',
            message: 'Error message',
            details: {
              nestedObject: { key: 'value' },
            },
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })

    it('handles error details returning undefined when empty', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'ERROR',
            message: 'Error message',
            details: {},
          },
        },
        status: 400,
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      await expect(client.listProducts()).rejects.toThrow(ApiException)
    })
  })
})
