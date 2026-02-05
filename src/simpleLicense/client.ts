/**
 * Main Client class for Simple License System API
 */

import axios from 'axios'
import {
  API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION,
  API_ENDPOINT_ADMIN_ANALYTICS_LICENSE,
  API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS,
  API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES,
  API_ENDPOINT_ADMIN_ANALYTICS_TRENDS,
  API_ENDPOINT_ADMIN_ANALYTICS_USAGE,
  API_ENDPOINT_ADMIN_AUDIT_LOGS,
  API_ENDPOINT_ADMIN_AUDIT_VERIFY,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_DELETE,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_GET,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_UPDATE,
  API_ENDPOINT_ADMIN_HEALTH,
  API_ENDPOINT_ADMIN_LICENSES_ACTIVATIONS,
  API_ENDPOINT_ADMIN_LICENSES_CREATE,
  API_ENDPOINT_ADMIN_LICENSES_FREEZE,
  API_ENDPOINT_ADMIN_LICENSES_GET,
  API_ENDPOINT_ADMIN_LICENSES_LIST,
  API_ENDPOINT_ADMIN_LICENSES_RESUME,
  API_ENDPOINT_ADMIN_LICENSES_REVOKE,
  API_ENDPOINT_ADMIN_LICENSES_SUSPEND,
  API_ENDPOINT_ADMIN_LICENSES_UPDATE,
  API_ENDPOINT_ADMIN_METRICS,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_DELETE,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_GET,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_UPDATE,
  API_ENDPOINT_ADMIN_PRODUCTS_CREATE,
  API_ENDPOINT_ADMIN_PRODUCTS_DELETE,
  API_ENDPOINT_ADMIN_PRODUCTS_GET,
  API_ENDPOINT_ADMIN_PRODUCTS_LIST,
  API_ENDPOINT_ADMIN_PRODUCTS_RESUME,
  API_ENDPOINT_ADMIN_PRODUCTS_SUSPEND,
  API_ENDPOINT_ADMIN_PRODUCTS_UPDATE,
  API_ENDPOINT_ADMIN_STATS,
  API_ENDPOINT_ADMIN_STATUS,
  API_ENDPOINT_ADMIN_TENANTS_BACKUP_PATH,
  API_ENDPOINT_ADMIN_TENANTS_CREATE,
  API_ENDPOINT_ADMIN_TENANTS_LIST,
  API_ENDPOINT_ADMIN_TENANTS_QUOTA_CONFIG_PATH,
  API_ENDPOINT_ADMIN_TENANTS_QUOTA_LIMITS_PATH,
  API_ENDPOINT_ADMIN_TENANTS_QUOTA_USAGE_PATH,
  API_ENDPOINT_ADMIN_TENANTS_RESUME,
  API_ENDPOINT_ADMIN_TENANTS_SUSPEND,
  API_ENDPOINT_ADMIN_TENANTS_UPDATE,
  API_ENDPOINT_ADMIN_USERS_CREATE,
  API_ENDPOINT_ADMIN_USERS_DELETE,
  API_ENDPOINT_ADMIN_USERS_GET,
  API_ENDPOINT_ADMIN_USERS_LIST,
  API_ENDPOINT_ADMIN_USERS_ME,
  API_ENDPOINT_ADMIN_USERS_ME_PASSWORD,
  API_ENDPOINT_ADMIN_USERS_UPDATE,
  API_ENDPOINT_AUTH_LOGIN,
  API_ENDPOINT_AUTH_LOGOUT,
  API_ENDPOINT_AUTH_REFRESH,
  API_ENDPOINT_LICENSES_ACTIVATE,
  API_ENDPOINT_LICENSES_DEACTIVATE,
  API_ENDPOINT_LICENSES_FEATURES,
  API_ENDPOINT_LICENSES_GET,
  API_ENDPOINT_LICENSES_USAGE,
  API_ENDPOINT_LICENSES_VALIDATE,
  API_ENDPOINT_UPDATES_CHECK,
  ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_LICENSE_EXPIRED,
  ERROR_CODE_LICENSE_NOT_FOUND,
} from './constants'
import {
  ActivationLimitExceededException,
  ApiException,
  AuthenticationException,
  LicenseExpiredException,
  LicenseNotFoundException,
} from './exceptions/ApiException'
import { AxiosHttpClient } from './http/AxiosHttpClient'
import type { HttpClientInterface } from './http/HttpClientInterface'
import type {
  ActionSuccessResponse,
  ActivateLicenseRequest,
  ActivateLicenseResponse,
  ActivationDistributionResponse,
  AlertThresholdsResponse,
  ApiResponse,
  AuditLogFilters,
  AuditVerificationParams,
  AuditVerificationResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CheckUpdateRequest,
  CheckUpdateResponse,
  CreateEntitlementRequest,
  CreateEntitlementResponse,
  CreateLicenseRequest,
  CreateLicenseResponse,
  CreateProductRequest,
  CreateProductResponse,
  CreateProductTierRequest,
  CreateProductTierResponse,
  CreateReleaseResponse,
  CreateTenantBackupResponse,
  CreateTenantRequest,
  CreateTenantResponse,
  CreateUserRequest,
  CreateUserResponse,
  DeactivateLicenseRequest,
  DeactivateLicenseResponse,
  ErrorDetails,
  FreezeLicenseRequest,
  FreezeLicenseResponse,
  GetAuditLogsResponse,
  GetCurrentUserResponse,
  GetEntitlementResponse,
  GetLicenseActivationsResponse,
  GetLicenseResponse,
  GetProductResponse,
  GetProductTierResponse,
  GetQuotaConfigResponse,
  GetQuotaUsageResponse,
  GetUserResponse,
  HealthMetricsResponse,
  LicenseDataResponse,
  LicenseFeaturesResponse,
  LicenseUsageDetailsResponse,
  ListEntitlementsResponse,
  ListLicensesRequest,
  ListLicensesResponse,
  ListProductsResponse,
  ListProductTiersResponse,
  ListReleasesResponse,
  ListTenantsResponse,
  ListUsersRequest,
  ListUsersResponse,
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  MetricsResponse,
  ReportUsageRequest,
  ServerStatusResponse,
  SystemStatsResponse,
  TopLicensesResponse,
  UpdateAlertThresholdsRequest,
  UpdateEntitlementRequest,
  UpdateEntitlementResponse,
  UpdateLicenseRequest,
  UpdateLicenseResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  UpdateProductTierRequest,
  UpdateProductTierResponse,
  UpdateQuotaLimitsRequest,
  UpdateTenantRequest,
  UpdateTenantResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UsageSummaryResponse,
  UsageTrendsResponse,
  ValidateLicenseRequest,
  ValidateLicenseResponse,
  ValidationError,
} from './types/api'
import type { ProductTier, User } from './types/license'

export type ClientOptions = {
  retryAttempts?: number
  retryDelayMs?: number
  timeoutSeconds?: number
}

export class Client {
  private readonly httpClient: HttpClientInterface
  private readonly baseUrl: string
  private authToken: string | null = null

  constructor(baseURL: string, httpClient?: HttpClientInterface, options?: ClientOptions) {
    const baseUrlClean = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
    this.baseUrl = baseUrlClean

    const onRefreshToken = async (): Promise<string | null> => {
      try {
        const response = await axios.post(`${this.baseUrl}${API_ENDPOINT_AUTH_REFRESH}`, {}, { withCredentials: true })
        const data = response.data
        if (data?.success && data?.token) {
          this.setToken(data.token)
          return data.token
        }
        return null
      } catch {
        this.setToken(null)
        return null
      }
    }

    this.httpClient =
      httpClient ||
      new AxiosHttpClient(baseUrlClean, options?.timeoutSeconds, {
        onRefreshToken,
        retryAttempts: options?.retryAttempts,
        retryDelayMs: options?.retryDelayMs,
      })
  }

  // Authentication methods
  async login(username: string, password: string): Promise<LoginResponse> {
    const request: LoginRequest = { username, password }
    const response = await this.httpClient.post<ApiResponse<LoginResponseData> | LoginResponseData>(
      API_ENDPOINT_AUTH_LOGIN,
      request
    )

    // Handle two possible response formats:
    // 1. Standard ApiResponse format: { success: true, data: { token, ... } }
    // 2. Direct login response format: { success: true, token, ... }
    const parsed = this.parseResponse(response.data)
    let loginData: LoginResponseData

    if (parsed.success && parsed.data) {
      // Standard ApiResponse format - data is wrapped
      loginData = parsed.data as unknown as LoginResponseData
    } else if (
      parsed.success &&
      typeof response.data === 'object' &&
      response.data !== null &&
      'token' in response.data
    ) {
      // Direct login response format - data is at root level
      loginData = response.data as unknown as LoginResponseData
    } else {
      // Error response
      const errorDetails: ErrorDetails = {
        code: parsed.error?.code || ERROR_CODE_INVALID_CREDENTIALS,
        status: response.status,
      }
      const errorMessage = parsed.error?.message || 'Authentication failed'

      throw new AuthenticationException(errorMessage, errorDetails)
    }

    if (!loginData || typeof loginData !== 'object') {
      throw new AuthenticationException('Invalid login response data')
    }

    const token = loginData.token
    const expiresInSeconds = loginData.expiresIn ?? loginData.expires_in ?? 0
    const tokenType = loginData.tokenType ?? loginData.token_type ?? 'Bearer'
    const normalizedUser = this.normalizeUser(loginData.user)
    const mustChangePassword =
      loginData.mustChangePassword ?? loginData.must_change_password ?? normalizedUser.passwordResetRequired ?? false

    if (!token || typeof token !== 'string') {
      throw new AuthenticationException('Invalid or missing token in login response')
    }

    this.setToken(token)
    if (this.httpClient instanceof AxiosHttpClient) {
      this.httpClient.setAuthToken(token)
    }

    return {
      token,
      token_type: tokenType,
      tokenType,
      expires_in: expiresInSeconds,
      expiresIn: expiresInSeconds,
      must_change_password: mustChangePassword,
      mustChangePassword,
      user: normalizedUser,
    }
  }

  async logout(): Promise<void> {
    try {
      await this.httpClient.post(API_ENDPOINT_AUTH_LOGOUT)
    } catch {
      // Ignore errors during logout
    }
    this.setToken(null)
  }

  /**
   * Explicitly attempts to restore the session using the HttpOnly cookie.
   * This is useful during app initialization when no access token is present.
   * @param signal Optional AbortSignal to cancel the request
   * @returns The new access token if successful, null otherwise.
   */
  async restoreSession(signal?: AbortSignal): Promise<string | null> {
    // If we already have a valid token, return it
    const currentToken = this.getToken()
    if (currentToken) {
      return currentToken
    }

    // Try to refresh via the cookie endpoint
    try {
      const response = await axios.post(
        `${this.baseUrl}${API_ENDPOINT_AUTH_REFRESH}`,
        {},
        { withCredentials: true, signal }
      )
      const data = response.data
      if (data?.success && data?.token) {
        const token = data.token
        this.setToken(token)
        return token
      }
    } catch {
      // Refresh failed (no cookie, invalid cookie, etc.)
    }

    this.setToken(null)
    return null
  }

  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await this.httpClient.patch<ApiResponse<ChangePasswordResponse>>(
      API_ENDPOINT_ADMIN_USERS_ME_PASSWORD,
      request
    )
    return this.handleApiResponse<ChangePasswordResponse>(response.data)
  }

  setToken(token: string | null): void {
    this.authToken = token

    if (this.httpClient instanceof AxiosHttpClient) {
      this.httpClient.setAuthToken(token)
    }
  }

  getToken(): string | null {
    return this.authToken
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  // Public API methods
  async activateLicense(
    licenseKey: string,
    domain: string,
    options?: {
      site_name?: string
      os?: string
      region?: string
      client_version?: string
      device_hash?: string
    }
  ): Promise<ActivateLicenseResponse> {
    const request: ActivateLicenseRequest = {
      license_key: licenseKey,
      domain,
      ...options,
    }

    const response = await this.httpClient.post<ApiResponse<ActivateLicenseResponse>>(
      API_ENDPOINT_LICENSES_ACTIVATE,
      request
    )

    return this.handleApiResponse(response.data, {} as ActivateLicenseResponse)
  }

  async validateLicense(licenseKey: string, domain: string): Promise<ValidateLicenseResponse> {
    const request: ValidateLicenseRequest = {
      license_key: licenseKey,
      domain,
    }

    const response = await this.httpClient.post<ApiResponse<ValidateLicenseResponse>>(
      API_ENDPOINT_LICENSES_VALIDATE,
      request
    )

    return this.handleApiResponse(response.data, {} as ValidateLicenseResponse)
  }

  async deactivateLicense(licenseKey: string, domain: string): Promise<DeactivateLicenseResponse> {
    const request: DeactivateLicenseRequest = {
      license_key: licenseKey,
      domain,
    }

    const response = await this.httpClient.post<ApiResponse<DeactivateLicenseResponse>>(
      API_ENDPOINT_LICENSES_DEACTIVATE,
      request
    )

    return this.handleApiResponse(response.data, {} as DeactivateLicenseResponse)
  }

  async reportUsage(request: ReportUsageRequest): Promise<ActionSuccessResponse> {
    const response = await this.httpClient.post<ApiResponse<ActionSuccessResponse>>(
      API_ENDPOINT_LICENSES_USAGE,
      request
    )

    return this.handleApiResponse(response.data, { success: true })
  }

  async getLicenseData(licenseKey: string): Promise<LicenseDataResponse> {
    const url = `${API_ENDPOINT_LICENSES_GET}/${encodeURIComponent(licenseKey)}`
    const response = await this.httpClient.get<ApiResponse<LicenseDataResponse>>(url)

    return this.handleApiResponse(response.data, {} as LicenseDataResponse)
  }

  async getLicenseFeatures(licenseKey: string): Promise<LicenseFeaturesResponse> {
    const url = `${API_ENDPOINT_LICENSES_FEATURES}/${encodeURIComponent(licenseKey)}/features`
    const response = await this.httpClient.get<ApiResponse<LicenseFeaturesResponse>>(url)

    return this.handleApiResponse(response.data, {} as LicenseFeaturesResponse)
  }

  async checkUpdate(request: CheckUpdateRequest): Promise<CheckUpdateResponse> {
    const response = await this.httpClient.post<ApiResponse<CheckUpdateResponse>>(API_ENDPOINT_UPDATES_CHECK, request)

    return this.handleApiResponse(response.data, {} as CheckUpdateResponse)
  }

  // Admin API - Licenses
  async listLicenses(filters?: ListLicensesRequest): Promise<ListLicensesResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.status) {
      queryParams.append('status', filters.status)
    }
    if (filters?.product_slug) {
      queryParams.append('product_slug', filters.product_slug)
    }
    if (filters?.customer_email) {
      queryParams.append('customer_email', filters.customer_email)
    }
    if (filters?.limit) {
      queryParams.append('limit', filters.limit.toString())
    }
    if (filters?.offset) {
      queryParams.append('offset', filters.offset.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString ? `${API_ENDPOINT_ADMIN_LICENSES_LIST}?${queryString}` : API_ENDPOINT_ADMIN_LICENSES_LIST

    const response = await this.httpClient.get<ApiResponse<ListLicensesResponse>>(url)
    return this.handleApiResponse(response.data, {} as ListLicensesResponse)
  }

  async createLicense(request: CreateLicenseRequest): Promise<CreateLicenseResponse> {
    const response = await this.httpClient.post<ApiResponse<CreateLicenseResponse>>(
      API_ENDPOINT_ADMIN_LICENSES_CREATE,
      request
    )
    return this.handleApiResponse(response.data, {} as CreateLicenseResponse)
  }

  async getLicense(idOrKey: string): Promise<GetLicenseResponse> {
    const url = `${API_ENDPOINT_ADMIN_LICENSES_GET}/${encodeURIComponent(idOrKey)}`
    const response = await this.httpClient.get<ApiResponse<GetLicenseResponse>>(url)

    return this.handleApiResponse(response.data, {} as GetLicenseResponse)
  }

  async updateLicense(idOrKey: string, request: UpdateLicenseRequest): Promise<UpdateLicenseResponse> {
    const url = `${API_ENDPOINT_ADMIN_LICENSES_UPDATE}/${encodeURIComponent(idOrKey)}`
    const response = await this.httpClient.put<ApiResponse<UpdateLicenseResponse>>(url, request)
    return this.handleApiResponse(response.data, {} as UpdateLicenseResponse)
  }

  async suspendLicense(idOrKey: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_LICENSES_SUSPEND}/${encodeURIComponent(idOrKey)}/suspend`
    const response = await this.httpClient.post<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async resumeLicense(idOrKey: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_LICENSES_RESUME}/${encodeURIComponent(idOrKey)}/resume`
    const response = await this.httpClient.post<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async freezeLicense(idOrKey: string, request?: FreezeLicenseRequest): Promise<FreezeLicenseResponse> {
    const url = `${API_ENDPOINT_ADMIN_LICENSES_FREEZE}/${encodeURIComponent(idOrKey)}/freeze`
    const response = await this.httpClient.post<ApiResponse<FreezeLicenseResponse>>(url, request || {})

    return this.handleApiResponse(response.data, {} as FreezeLicenseResponse)
  }

  async revokeLicense(idOrKey: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_LICENSES_REVOKE}/${encodeURIComponent(idOrKey)}`
    const response = await this.httpClient.delete<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async getLicenseActivations(idOrKey: string): Promise<GetLicenseActivationsResponse> {
    const url = `${API_ENDPOINT_ADMIN_LICENSES_ACTIVATIONS}/${encodeURIComponent(idOrKey)}/activations`
    const response = await this.httpClient.get<ApiResponse<GetLicenseActivationsResponse>>(url)

    return this.handleApiResponse(response.data, {} as GetLicenseActivationsResponse)
  }

  // Admin API - Products
  async listProducts(): Promise<ListProductsResponse> {
    const response = await this.httpClient.get<ApiResponse<ListProductsResponse>>(API_ENDPOINT_ADMIN_PRODUCTS_LIST)

    return this.handleApiResponse(response.data, {} as ListProductsResponse)
  }

  async createProduct(request: CreateProductRequest): Promise<CreateProductResponse> {
    const response = await this.httpClient.post<ApiResponse<CreateProductResponse>>(
      API_ENDPOINT_ADMIN_PRODUCTS_CREATE,
      request
    )

    return this.handleApiResponse(response.data, {} as CreateProductResponse)
  }

  async getProduct(id: string): Promise<GetProductResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_GET}/${encodeURIComponent(id)}`
    const response = await this.httpClient.get<ApiResponse<GetProductResponse>>(url)

    return this.handleApiResponse(response.data, {} as GetProductResponse)
  }

  async updateProduct(id: string, request: UpdateProductRequest): Promise<UpdateProductResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_UPDATE}/${encodeURIComponent(id)}`
    const response = await this.httpClient.put<ApiResponse<UpdateProductResponse>>(url, request)

    return this.handleApiResponse(response.data, {} as UpdateProductResponse)
  }

  async deleteProduct(id: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_DELETE}/${encodeURIComponent(id)}`
    const response = await this.httpClient.delete<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async suspendProduct(id: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_SUSPEND}/${encodeURIComponent(id)}/suspend`
    const response = await this.httpClient.post<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async resumeProduct(id: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_RESUME}/${encodeURIComponent(id)}/resume`
    const response = await this.httpClient.post<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  // Admin API - Releases (plugin release files per product)
  async listReleases(
    productId: string,
    params?: { sortBy?: string; sortOrder?: string; isPrerelease?: boolean }
  ): Promise<ListReleasesResponse> {
    const baseUrl = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases`
    const searchParams = new URLSearchParams()
    if (params?.sortBy) {
      searchParams.set('sortBy', params.sortBy)
    }
    if (params?.sortOrder) {
      searchParams.set('sortOrder', params.sortOrder)
    }
    if (params?.isPrerelease !== undefined) {
      searchParams.set('isPrerelease', String(params.isPrerelease))
    }
    const url = searchParams.toString() ? `${baseUrl}?${searchParams.toString()}` : baseUrl
    const response = await this.httpClient.get<ApiResponse<ListReleasesResponse>>(url)

    return this.handleApiResponse(response.data, [])
  }

  async promoteRelease(productId: string, releaseId: string): Promise<CreateReleaseResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases/${encodeURIComponent(releaseId)}/promote`
    const response = await this.httpClient.patch<ApiResponse<CreateReleaseResponse>>(url)

    return this.handleApiResponse(response.data, {} as CreateReleaseResponse)
  }

  async createRelease(productId: string, formData: FormData): Promise<CreateReleaseResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases`
    const response = await this.httpClient.postFormData<ApiResponse<CreateReleaseResponse>>(url, formData)

    return this.handleApiResponse(response.data, {} as CreateReleaseResponse)
  }

  // Admin API - Product Tiers
  async listProductTiers(productId: string): Promise<ListProductTiersResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/tiers`
    const response = await this.httpClient.get<ApiResponse<ProductTier[]>>(url)

    // Backend returns { success: true, data: ProductTier[] }
    // Frontend expects PaginatedResponse<ProductTier> but backend doesn't paginate
    // So we wrap the array in the expected format
    const tiers = this.handleApiResponse<ProductTier[]>(response.data, [])

    // Wrap array in PaginatedResponse format
    return {
      success: true,
      data: tiers,
      pagination: {
        page: 1,
        limit: tiers.length,
        total: tiers.length,
        totalPages: 1,
      },
    }
  }

  async createProductTier(productId: string, request: CreateProductTierRequest): Promise<CreateProductTierResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/tiers`
    const response = await this.httpClient.post<ApiResponse<CreateProductTierResponse>>(url, request)

    return this.handleApiResponse(response.data, {} as CreateProductTierResponse)
  }

  async getProductTier(id: string): Promise<GetProductTierResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCT_TIERS_GET}/${encodeURIComponent(id)}`
    const response = await this.httpClient.get<ApiResponse<GetProductTierResponse>>(url)

    return this.handleApiResponse(response.data, {} as GetProductTierResponse)
  }

  async updateProductTier(id: string, request: UpdateProductTierRequest): Promise<UpdateProductTierResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCT_TIERS_UPDATE}/${encodeURIComponent(id)}`
    const response = await this.httpClient.put<ApiResponse<UpdateProductTierResponse>>(url, request)

    return this.handleApiResponse(response.data, {} as UpdateProductTierResponse)
  }

  async deleteProductTier(id: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCT_TIERS_DELETE}/${encodeURIComponent(id)}`
    const response = await this.httpClient.delete<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  // Admin API - Entitlements
  async listEntitlements(productId: string): Promise<ListEntitlementsResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/entitlements`
    const response = await this.httpClient.get<ApiResponse<ListEntitlementsResponse>>(url)

    return this.handleApiResponse(response.data, {} as ListEntitlementsResponse)
  }

  async createEntitlement(productId: string, request: CreateEntitlementRequest): Promise<CreateEntitlementResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/entitlements`
    const response = await this.httpClient.post<ApiResponse<CreateEntitlementResponse>>(url, request)

    return this.handleApiResponse(response.data, {} as CreateEntitlementResponse)
  }

  async getEntitlement(id: string): Promise<GetEntitlementResponse> {
    const url = `${API_ENDPOINT_ADMIN_ENTITLEMENTS_GET}/${encodeURIComponent(id)}`
    const response = await this.httpClient.get<ApiResponse<GetEntitlementResponse>>(url)

    return this.handleApiResponse(response.data, {} as GetEntitlementResponse)
  }

  async updateEntitlement(id: string, request: UpdateEntitlementRequest): Promise<UpdateEntitlementResponse> {
    const url = `${API_ENDPOINT_ADMIN_ENTITLEMENTS_UPDATE}/${encodeURIComponent(id)}`
    const response = await this.httpClient.put<ApiResponse<UpdateEntitlementResponse>>(url, request)

    return this.handleApiResponse(response.data, {} as UpdateEntitlementResponse)
  }

  async deleteEntitlement(id: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_ENTITLEMENTS_DELETE}/${encodeURIComponent(id)}`
    const response = await this.httpClient.delete<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  // Admin API - Users
  async listUsers(filters?: ListUsersRequest): Promise<ListUsersResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.role) {
      queryParams.append('role', filters.role)
    }
    if (filters?.vendor_id) {
      queryParams.append('vendor_id', filters.vendor_id)
    }
    if (filters?.search) {
      queryParams.append('search', filters.search)
    }
    if (typeof filters?.limit === 'number') {
      queryParams.append('limit', String(filters.limit))
    }
    if (typeof filters?.offset === 'number') {
      queryParams.append('offset', String(filters.offset))
    }

    const url =
      queryParams.size > 0
        ? `${API_ENDPOINT_ADMIN_USERS_LIST}?${queryParams.toString()}`
        : API_ENDPOINT_ADMIN_USERS_LIST

    const response = await this.httpClient.get<ApiResponse<ListUsersResponse>>(url)

    return this.handleApiResponse(response.data, {} as ListUsersResponse)
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await this.httpClient.post<ApiResponse<CreateUserResponse>>(
      API_ENDPOINT_ADMIN_USERS_CREATE,
      request
    )

    return this.handleApiResponse(response.data, {} as CreateUserResponse)
  }

  async getUser(id: string): Promise<GetUserResponse> {
    const url = `${API_ENDPOINT_ADMIN_USERS_GET}/${encodeURIComponent(id)}`
    const response = await this.httpClient.get<ApiResponse<GetUserResponse>>(url)

    return this.handleApiResponse(response.data, {} as GetUserResponse)
  }

  async updateUser(id: string, request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const url = `${API_ENDPOINT_ADMIN_USERS_UPDATE}/${encodeURIComponent(id)}`
    const response = await this.httpClient.put<ApiResponse<UpdateUserResponse>>(url, request)

    return this.handleApiResponse(response.data, {} as UpdateUserResponse)
  }

  async deleteUser(id: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_USERS_DELETE}/${encodeURIComponent(id)}`
    const response = await this.httpClient.delete<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    const response = await this.httpClient.get<ApiResponse<GetCurrentUserResponse>>(API_ENDPOINT_ADMIN_USERS_ME)

    return this.handleApiResponse(response.data, {} as GetCurrentUserResponse)
  }

  // Admin API - Tenants
  async listTenants(): Promise<ListTenantsResponse> {
    const response = await this.httpClient.get<ApiResponse<ListTenantsResponse>>(API_ENDPOINT_ADMIN_TENANTS_LIST)

    return this.handleApiResponse(response.data, {} as ListTenantsResponse)
  }

  async createTenant(request: CreateTenantRequest): Promise<CreateTenantResponse> {
    const response = await this.httpClient.post<ApiResponse<CreateTenantResponse>>(
      API_ENDPOINT_ADMIN_TENANTS_CREATE,
      request
    )

    return this.handleApiResponse(response.data, {} as CreateTenantResponse)
  }

  async updateTenant(id: string, request: UpdateTenantRequest): Promise<UpdateTenantResponse> {
    const url = `${API_ENDPOINT_ADMIN_TENANTS_UPDATE}/${encodeURIComponent(id)}`
    const response = await this.httpClient.put<ApiResponse<UpdateTenantResponse>>(url, request)

    return this.handleApiResponse(response.data, {} as UpdateTenantResponse)
  }

  async suspendTenant(id: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_TENANTS_SUSPEND}/${encodeURIComponent(id)}/suspend`
    const response = await this.httpClient.post<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async resumeTenant(id: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_TENANTS_RESUME}/${encodeURIComponent(id)}/resume`
    const response = await this.httpClient.post<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async getQuotaUsage(tenantId: string): Promise<GetQuotaUsageResponse> {
    const url = `${API_ENDPOINT_ADMIN_TENANTS_LIST}/${encodeURIComponent(tenantId)}${API_ENDPOINT_ADMIN_TENANTS_QUOTA_USAGE_PATH}`
    const response = await this.httpClient.get<ApiResponse<GetQuotaUsageResponse>>(url)

    return this.handleApiResponse(response.data, {} as GetQuotaUsageResponse)
  }

  async getQuotaConfig(tenantId: string): Promise<GetQuotaConfigResponse> {
    const url = `${API_ENDPOINT_ADMIN_TENANTS_LIST}/${encodeURIComponent(tenantId)}${API_ENDPOINT_ADMIN_TENANTS_QUOTA_CONFIG_PATH}`
    const response = await this.httpClient.get<ApiResponse<GetQuotaConfigResponse>>(url)

    return this.handleApiResponse(response.data, {} as GetQuotaConfigResponse)
  }

  async updateQuotaLimits(tenantId: string, request: UpdateQuotaLimitsRequest): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_TENANTS_LIST}/${encodeURIComponent(tenantId)}${API_ENDPOINT_ADMIN_TENANTS_QUOTA_LIMITS_PATH}`
    const response = await this.httpClient.put<ApiResponse<{ success: boolean }>>(url, request)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async createTenantBackup(tenantId: string): Promise<CreateTenantBackupResponse> {
    const url = `${API_ENDPOINT_ADMIN_TENANTS_LIST}/${encodeURIComponent(tenantId)}${API_ENDPOINT_ADMIN_TENANTS_BACKUP_PATH}`
    const response = await this.httpClient.post<ApiResponse<CreateTenantBackupResponse>>(url)

    return this.handleApiResponse(response.data, {} as CreateTenantBackupResponse)
  }

  // Admin API - System Monitoring
  async getServerStatus(): Promise<ServerStatusResponse> {
    const response = await this.httpClient.get<ApiResponse<ServerStatusResponse>>(API_ENDPOINT_ADMIN_STATUS)

    return this.handleApiResponse(response.data, {} as ServerStatusResponse)
  }

  async getHealthMetrics(): Promise<HealthMetricsResponse> {
    const response = await this.httpClient.get<ApiResponse<HealthMetricsResponse>>(API_ENDPOINT_ADMIN_HEALTH)

    return this.handleApiResponse(response.data, {} as HealthMetricsResponse)
  }

  async getSystemMetrics(): Promise<MetricsResponse> {
    const response = await this.httpClient.get<ApiResponse<MetricsResponse>>(API_ENDPOINT_ADMIN_METRICS)

    return this.handleApiResponse(response.data, {} as MetricsResponse)
  }

  // Admin API - Analytics
  async getSystemStats(): Promise<SystemStatsResponse> {
    const response = await this.httpClient.get<ApiResponse<SystemStatsResponse>>(API_ENDPOINT_ADMIN_STATS)

    return this.handleApiResponse(response.data, {} as SystemStatsResponse)
  }

  async getLicenseUsageDetails(
    licenseKey: string,
    params?: { periodStart?: string; periodEnd?: string }
  ): Promise<LicenseUsageDetailsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.periodStart) {
      queryParams.append('periodStart', params.periodStart)
    }
    if (params?.periodEnd) {
      queryParams.append('periodEnd', params.periodEnd)
    }

    const baseUrl = `${API_ENDPOINT_ADMIN_ANALYTICS_LICENSE}/${encodeURIComponent(licenseKey)}`
    const url = queryParams.size > 0 ? `${baseUrl}?${queryParams.toString()}` : baseUrl

    const response = await this.httpClient.get<ApiResponse<LicenseUsageDetailsResponse>>(url)

    return this.handleApiResponse(response.data, {} as LicenseUsageDetailsResponse)
  }

  async getUsageSummaries(): Promise<UsageSummaryResponse> {
    const response = await this.httpClient.get<ApiResponse<UsageSummaryResponse>>(API_ENDPOINT_ADMIN_ANALYTICS_USAGE)

    return this.handleApiResponse(response.data, {} as UsageSummaryResponse)
  }

  async getUsageTrends(): Promise<UsageTrendsResponse> {
    const response = await this.httpClient.get<ApiResponse<UsageTrendsResponse>>(API_ENDPOINT_ADMIN_ANALYTICS_TRENDS)

    return this.handleApiResponse(response.data, {} as UsageTrendsResponse)
  }

  async getActivationDistribution(): Promise<ActivationDistributionResponse> {
    const response = await this.httpClient.get<ApiResponse<ActivationDistributionResponse>>(
      API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION
    )

    return this.handleApiResponse(response.data, {} as ActivationDistributionResponse)
  }

  async getAlertThresholds(): Promise<AlertThresholdsResponse> {
    const response = await this.httpClient.get<ApiResponse<AlertThresholdsResponse>>(
      API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS
    )

    return this.handleApiResponse(response.data, {} as AlertThresholdsResponse)
  }

  async updateAlertThresholds(request: UpdateAlertThresholdsRequest): Promise<AlertThresholdsResponse> {
    const response = await this.httpClient.put<ApiResponse<AlertThresholdsResponse>>(
      API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS,
      request
    )

    return this.handleApiResponse(response.data, {} as AlertThresholdsResponse)
  }

  async getTopLicenses(): Promise<TopLicensesResponse> {
    const response = await this.httpClient.get<ApiResponse<TopLicensesResponse>>(
      API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES
    )

    return this.handleApiResponse(response.data, {} as TopLicensesResponse)
  }

  async getAuditLogs(filters?: AuditLogFilters): Promise<GetAuditLogsResponse> {
    const queryParams = new URLSearchParams()
    if (filters?.adminId) {
      queryParams.append('adminId', filters.adminId)
    }
    if (filters?.action) {
      queryParams.append('action', filters.action)
    }
    if (filters?.resourceType) {
      queryParams.append('resourceType', filters.resourceType)
    }
    if (filters?.resourceId) {
      queryParams.append('resourceId', filters.resourceId)
    }
    if (typeof filters?.limit === 'number') {
      queryParams.append('limit', String(filters.limit))
    }
    if (typeof filters?.offset === 'number') {
      queryParams.append('offset', String(filters.offset))
    }

    const url =
      queryParams.size > 0
        ? `${API_ENDPOINT_ADMIN_AUDIT_LOGS}?${queryParams.toString()}`
        : API_ENDPOINT_ADMIN_AUDIT_LOGS

    const response = await this.httpClient.get<ApiResponse<GetAuditLogsResponse>>(url)

    return this.handleApiResponse(response.data, {} as GetAuditLogsResponse)
  }

  async verifyAuditChain(params?: AuditVerificationParams): Promise<AuditVerificationResponse> {
    const queryParams = new URLSearchParams()
    if (params?.fromId) {
      queryParams.append('fromId', params.fromId)
    }
    if (params?.toId) {
      queryParams.append('toId', params.toId)
    }

    const url =
      queryParams.size > 0
        ? `${API_ENDPOINT_ADMIN_AUDIT_VERIFY}?${queryParams.toString()}`
        : API_ENDPOINT_ADMIN_AUDIT_VERIFY

    const response = await this.httpClient.get<ApiResponse<AuditVerificationResponse>>(url)

    return this.handleApiResponse(response.data, {} as AuditVerificationResponse)
  }

  // Helper methods - type guards for response parsing
  private isApiResponse(value: unknown): value is ApiResponse {
    return (
      typeof value === 'object' &&
      value !== null &&
      'success' in value &&
      typeof (value as { success: unknown }).success === 'boolean'
    )
  }

  private parseResponse(response: unknown): ApiResponse {
    if (this.isApiResponse(response)) {
      return response
    }
    // If it's an object but not a valid API response, return error response
    if (typeof response === 'object' && response !== null) {
      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid API response format',
        },
      }
    }
    return {
      success: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Response is not an object',
      },
    }
  }

  private parseErrorDetails(errorObj: unknown): ErrorDetails | undefined {
    if (typeof errorObj !== 'object' || errorObj === null) {
      return undefined
    }

    const details: ErrorDetails = {}

    if ('field' in errorObj && typeof errorObj.field === 'string') {
      details.field = errorObj.field
    }

    if ('resourceType' in errorObj && typeof errorObj.resourceType === 'string') {
      details.resourceType = errorObj.resourceType
    }

    if ('validationErrors' in errorObj && Array.isArray(errorObj.validationErrors)) {
      const validErrors: ValidationError[] = []
      for (const err of errorObj.validationErrors) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'path' in err &&
          'message' in err &&
          typeof (err as { message: unknown }).message === 'string'
        ) {
          validErrors.push({
            path: (err as { path: unknown }).path as string | number | Array<string | number>,
            message: (err as { message: string }).message,
            ...('type' in err && typeof err.type === 'string' ? { type: err.type } : {}),
            ...('context' in err &&
            typeof err.context === 'object' &&
            err.context !== null &&
            !Array.isArray(err.context)
              ? { context: err.context as Record<string, string | number | boolean> }
              : {}),
          })
        }
      }
      if (validErrors.length > 0) {
        details.validationErrors = validErrors
      }
    }

    // Copy other string/number/boolean properties
    for (const [key, value] of Object.entries(errorObj)) {
      if (
        !['field', 'resourceType', 'validationErrors'].includes(key) &&
        (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null)
      ) {
        details[key] = value
      }
    }

    return Object.keys(details).length > 0 ? details : undefined
  }

  private handleApiResponse<T>(response: unknown, defaultData?: T): T {
    // console.log('[SDK] handleApiResponse raw:', response)
    const parsed = this.parseResponse(response)
    // console.log('[SDK] handleApiResponse parsed:', parsed)

    if (!parsed.success) {
      const errorDetails = parsed.error ? this.parseErrorDetails(parsed.error.details) : undefined
      const errorCode = parsed.error?.code || 'UNKNOWN_ERROR'
      const errorMessage = parsed.error?.message || 'API request failed'

      this.handleError(errorCode, errorMessage, errorDetails)
    }

    if (parsed.data) {
      // Type assertion is safe here because we validated parsed.success and parsed.data above
      // If data doesn't match T, that's a runtime error we need to catch
      return parsed.data as T
    }

    if (defaultData !== undefined) {
      return defaultData
    }

    throw new ApiException(
      'API response missing data',
      'INVALID_RESPONSE',
      this.parseErrorDetails(parsed.error?.details)
    )
  }

  private handleError(errorCode: string, errorMessage: string, errorDetails?: ErrorDetails): never {
    switch (errorCode) {
      case ERROR_CODE_LICENSE_NOT_FOUND:
        throw new LicenseNotFoundException(errorMessage, errorDetails)
      case ERROR_CODE_LICENSE_EXPIRED:
        throw new LicenseExpiredException(errorMessage, errorDetails)
      case ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED:
        throw new ActivationLimitExceededException(errorMessage, errorDetails)
      default:
        throw new ApiException(errorMessage, errorCode, errorDetails)
    }
  }

  private normalizeUser(user: unknown): User {
    if (typeof user !== 'object' || user === null) {
      return {} as User
    }
    const typedUser = user as User
    const passwordResetRequired =
      typedUser.passwordResetRequired ??
      (user as { password_reset_required?: boolean }).password_reset_required ??
      false

    return {
      ...typedUser,
      passwordResetRequired,
    }
  }
}
