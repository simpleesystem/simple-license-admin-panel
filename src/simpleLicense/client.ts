/**
 * Main Client class for Simple License System API
 */

import axios from 'axios'
import {
  ACCESS_BARRIER_ERROR_CODES,
  ACCESS_LOGOUT_PATH,
  API_ENDPOINT_ADMIN_AGENT_CREDENTIAL_REVOKE_SUFFIX,
  API_ENDPOINT_ADMIN_AGENT_CREDENTIALS_BATCH_REVOKE_SUFFIX,
  API_ENDPOINT_ADMIN_AGENT_CREDENTIALS_SUFFIX,
  API_ENDPOINT_ADMIN_AGENT_SERVICE_ACCOUNTS,
  API_ENDPOINT_ADMIN_ANALYTICS_DISTRIBUTION,
  API_ENDPOINT_ADMIN_ANALYTICS_LICENSE,
  API_ENDPOINT_ADMIN_ANALYTICS_THRESHOLDS,
  API_ENDPOINT_ADMIN_ANALYTICS_TOP_LICENSES,
  API_ENDPOINT_ADMIN_ANALYTICS_TRENDS,
  API_ENDPOINT_ADMIN_ANALYTICS_USAGE,
  API_ENDPOINT_ADMIN_AUDIT_LOGS,
  API_ENDPOINT_ADMIN_AUDIT_VERIFY,
  API_ENDPOINT_ADMIN_DASHBOARD_SNAPSHOT,
  API_ENDPOINT_ADMIN_EMAIL_STATUS,
  API_ENDPOINT_ADMIN_EMAIL_TEST,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_BATCH_DELETE_SUFFIX,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_DELETE,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_GET,
  API_ENDPOINT_ADMIN_ENTITLEMENTS_UPDATE,
  API_ENDPOINT_ADMIN_HEALTH,
  API_ENDPOINT_ADMIN_HEALTH_SNAPSHOT,
  API_ENDPOINT_ADMIN_LICENSES_ACTIVATIONS,
  API_ENDPOINT_ADMIN_LICENSES_BATCH_SOFT_DELETE,
  API_ENDPOINT_ADMIN_LICENSES_CHANGE_DOMAIN,
  API_ENDPOINT_ADMIN_LICENSES_CREATE,
  API_ENDPOINT_ADMIN_LICENSES_FREEZE,
  API_ENDPOINT_ADMIN_LICENSES_GET,
  API_ENDPOINT_ADMIN_LICENSES_LIST,
  API_ENDPOINT_ADMIN_LICENSES_MARK_REVOKED,
  API_ENDPOINT_ADMIN_LICENSES_RESUME,
  API_ENDPOINT_ADMIN_LICENSES_REVOKE,
  API_ENDPOINT_ADMIN_LICENSES_SUSPEND,
  API_ENDPOINT_ADMIN_LICENSES_UPDATE,
  API_ENDPOINT_ADMIN_METRICS,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_BATCH_DELETE_SUFFIX,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_DELETE,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_GET,
  API_ENDPOINT_ADMIN_PRODUCT_TIERS_UPDATE,
  API_ENDPOINT_ADMIN_PRODUCTS_BATCH_DELETE,
  API_ENDPOINT_ADMIN_PRODUCTS_BATCH_RESUME,
  API_ENDPOINT_ADMIN_PRODUCTS_BATCH_SUSPEND,
  API_ENDPOINT_ADMIN_PRODUCTS_CREATE,
  API_ENDPOINT_ADMIN_PRODUCTS_DELETE,
  API_ENDPOINT_ADMIN_PRODUCTS_GET,
  API_ENDPOINT_ADMIN_PRODUCTS_LIST,
  API_ENDPOINT_ADMIN_PRODUCTS_RESUME,
  API_ENDPOINT_ADMIN_PRODUCTS_SUSPEND,
  API_ENDPOINT_ADMIN_PRODUCTS_UPDATE,
  API_ENDPOINT_ADMIN_PROTECTION_BUILD_TOKENS_BATCH_REVOKE_SUFFIX,
  API_ENDPOINT_ADMIN_RELEASES_BATCH_DELETE_SUFFIX,
  API_ENDPOINT_ADMIN_STATS,
  API_ENDPOINT_ADMIN_STATUS,
  API_ENDPOINT_ADMIN_TENANTS_BACKUP_PATH,
  API_ENDPOINT_ADMIN_TENANTS_BATCH_RESUME,
  API_ENDPOINT_ADMIN_TENANTS_BATCH_SUSPEND,
  API_ENDPOINT_ADMIN_TENANTS_CREATE,
  API_ENDPOINT_ADMIN_TENANTS_LIST,
  API_ENDPOINT_ADMIN_TENANTS_QUOTA_CONFIG_PATH,
  API_ENDPOINT_ADMIN_TENANTS_QUOTA_LIMITS_PATH,
  API_ENDPOINT_ADMIN_TENANTS_QUOTA_USAGE_PATH,
  API_ENDPOINT_ADMIN_TENANTS_RESUME,
  API_ENDPOINT_ADMIN_TENANTS_SUSPEND,
  API_ENDPOINT_ADMIN_TENANTS_UPDATE,
  API_ENDPOINT_ADMIN_USERS_BATCH_DELETE,
  API_ENDPOINT_ADMIN_USERS_CREATE,
  API_ENDPOINT_ADMIN_USERS_DELETE,
  API_ENDPOINT_ADMIN_USERS_GET,
  API_ENDPOINT_ADMIN_USERS_LIST,
  API_ENDPOINT_ADMIN_USERS_ME,
  API_ENDPOINT_ADMIN_USERS_ME_PASSWORD,
  API_ENDPOINT_ADMIN_USERS_RESET_PASSWORD,
  API_ENDPOINT_ADMIN_USERS_RESET_PASSWORD_SUFFIX,
  API_ENDPOINT_ADMIN_USERS_SET_SERVICE_PASSWORD,
  API_ENDPOINT_ADMIN_USERS_SET_SERVICE_PASSWORD_SUFFIX,
  API_ENDPOINT_ADMIN_USERS_UPDATE,
  API_ENDPOINT_AUTH_ACCESS_BOOTSTRAP,
  API_ENDPOINT_AUTH_LOGIN,
  API_ENDPOINT_AUTH_LOGOUT,
  API_ENDPOINT_AUTH_REFRESH,
  API_ENDPOINT_LICENSES_ACTIVATE,
  API_ENDPOINT_LICENSES_DEACTIVATE,
  API_ENDPOINT_LICENSES_FEATURES,
  API_ENDPOINT_LICENSES_GET,
  API_ENDPOINT_LICENSES_USAGE,
  API_ENDPOINT_LICENSES_VALIDATE,
  API_ENDPOINT_PROTECTION_KEYS,
  API_ENDPOINT_UPDATES_CHECK,
  EMAIL_TEST_REQUEST_TIMEOUT_MS,
  ERROR_CODE_ACTIVATION_LIMIT_EXCEEDED,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_LICENSE_EXPIRED,
  ERROR_CODE_LICENSE_NOT_FOUND,
  ERROR_MESSAGE_ACCESS_BOOTSTRAP_FAILED,
  RELEASE_UPLOAD_REQUEST_TIMEOUT_MS,
} from './constants'
import {
  EMAIL_OUTCOME_UNKNOWN,
  EMAIL_STATUS_UNAVAILABLE,
  type EmailDeliveryStatus,
  type EmailTestResult,
  parseEmailDeliveryStatus,
  parseEmailTestResult,
} from './email'
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
  AgentServiceAccount,
  AlertThresholdsResponse,
  ApiResponse,
  AuditLogEntry,
  AuditLogFilters,
  AuditVerificationParams,
  AuditVerificationResponse,
  BatchDeleteEntitlementsRequest,
  BatchDeleteProductsRequest,
  BatchDeleteProductTiersRequest,
  BatchDeleteReleasesRequest,
  BatchDeleteUsersRequest,
  BatchOperationResponse,
  BatchOperationResultData,
  BatchRevokeAgentCredentialsRequest,
  BatchRevokeProtectionBuildTokensRequest,
  BatchSoftDeleteLicensesRequest,
  BatchSuspendTenantsRequest,
  ChangeLicenseDomainRequest,
  ChangeLicenseDomainResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  CheckUpdateRequest,
  CheckUpdateResponse,
  CreateAgentServiceAccountRequest,
  CreateAgentServiceAccountResponse,
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
  DashboardSnapshotResponse,
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
  HealthSnapshotResponse,
  IssueAgentServiceCredentialRequest,
  IssueAgentServiceCredentialResponse,
  IssueProtectionBuildTokenRequest,
  IssueProtectionBuildTokenResponse,
  LicenseDataResponse,
  LicenseFeaturesResponse,
  LicenseUsageDetailsResponse,
  ListEntitlementsResponse,
  ListLicensesRequest,
  ListLicensesResponse,
  ListProductsResponse,
  ListProductTiersResponse,
  ListProtectionBuildTokensResponse,
  ListReleasesResponse,
  ListTenantsResponse,
  ListUsersRequest,
  ListUsersResponse,
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  MetricsResponse,
  ProtectionBuildTokenMetadata,
  ProtectionSigningPublicKeyResponse,
  ReportUsageRequest,
  ResetUserPasswordRequest,
  ResetUserPasswordResponse,
  RevokeAgentServiceCredentialResponse,
  RevokeProtectionBuildTokenResponse,
  ServerStatusResponse,
  SetServiceAccountPasswordRequest,
  SetServiceAccountPasswordResponse,
  SystemStatsResponse,
  TopLicensesResponse,
  UpdateAgentServiceAccountRequest,
  UpdateAgentServiceAccountResponse,
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
import type {
  ReleaseOperationRecord,
  ReleasePublicationExpected,
  ReleasePublicationReceipt,
} from './utils/releasePublicationOperation'
import {
  findReleaseOperation,
  listReleaseOperations,
  persistReleaseOperation,
  prepareCreateReleaseOperation,
  prepareReleaseMaintenance,
  prepareRepairReleaseOperation,
  releaseOperationScope,
  validatePublicationReceipt,
  verifyPreparedMaintenanceContext,
} from './utils/releasePublicationOperation'

export type ClientOptions = {
  accessBootstrapBaseUrl?: string
  retryAttempts?: number
  retryDelayMs?: number
  timeoutSeconds?: number
}

export class Client {
  private readonly httpClient: HttpClientInterface
  private readonly baseUrl: string
  private readonly accessBootstrapBaseUrl: string | null
  private authToken: string | null = null
  private authenticatedViaAccess = false

  constructor(baseURL: string, httpClient?: HttpClientInterface, options?: ClientOptions) {
    const baseUrlClean = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
    this.baseUrl = baseUrlClean
    const accessBaseUrl = options?.accessBootstrapBaseUrl?.trim()
    this.accessBootstrapBaseUrl = accessBaseUrl
      ? accessBaseUrl.endsWith('/')
        ? accessBaseUrl.slice(0, -1)
        : accessBaseUrl
      : null

    const onRefreshToken = async (): Promise<string | null> => {
      const accessToken = await this.requestAccessSession()
      if (accessToken) {
        return accessToken
      }
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
    this.authenticatedViaAccess = false
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

  async logout(): Promise<string | null> {
    const accessLogoutPath = this.authenticatedViaAccess ? ACCESS_LOGOUT_PATH : null
    try {
      await this.httpClient.post(API_ENDPOINT_AUTH_LOGOUT)
    } catch {
      // Ignore errors during logout
    }
    this.setToken(null)
    this.authenticatedViaAccess = false
    return accessLogoutPath
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

    const accessToken = await this.requestAccessSession(signal)
    if (accessToken) {
      return accessToken
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

  private async requestAccessSession(signal?: AbortSignal): Promise<string | null> {
    if (this.accessBootstrapBaseUrl === null) {
      return null
    }
    try {
      const response = await axios.post(
        `${this.accessBootstrapBaseUrl}${API_ENDPOINT_AUTH_ACCESS_BOOTSTRAP}`,
        {},
        { withCredentials: true, signal }
      )
      const data = response.data
      if (data?.success && typeof data?.token === 'string' && data.token !== '') {
        this.authenticatedViaAccess = true
        this.setToken(data.token)
        return data.token
      }
    } catch (error) {
      const accessError = this.accessBarrierError(error)
      if (accessError) {
        throw accessError
      }
    }
    return null
  }

  private accessBarrierError(error: unknown): ApiException | null {
    if (!axios.isAxiosError(error)) {
      return null
    }
    const responseData = error.response?.data
    if (typeof responseData !== 'object' || responseData === null || !('error' in responseData)) {
      return null
    }
    const errorData = responseData.error
    if (typeof errorData !== 'object' || errorData === null) {
      return null
    }
    const code = 'code' in errorData && typeof errorData.code === 'string' ? errorData.code : ''
    if (!ACCESS_BARRIER_ERROR_CODES.some((candidate) => candidate === code)) {
      return null
    }
    const message =
      'message' in errorData && typeof errorData.message === 'string'
        ? errorData.message
        : ERROR_MESSAGE_ACCESS_BOOTSTRAP_FAILED
    return new ApiException(message, code, { status: error.response?.status })
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

  async getProtectionSigningPublicKey(
    productSlug: string,
    signingKeyId?: string
  ): Promise<ProtectionSigningPublicKeyResponse> {
    const queryParams = new URLSearchParams()
    queryParams.set('product_slug', productSlug)
    if (typeof signingKeyId === 'string' && signingKeyId.trim().length > 0) {
      queryParams.set('signing_key_id', signingKeyId)
    }
    const url = `${API_ENDPOINT_PROTECTION_KEYS}?${queryParams.toString()}`
    const response = await this.httpClient.get<ApiResponse<ProtectionSigningPublicKeyResponse>>(url)
    const rawData = this.handleApiResponse<Record<string, unknown>>(response.data, {})
    return this.normalizeProtectionSigningPublicKeyResponse(rawData)
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
    if (filters?.search) {
      queryParams.append('search', filters.search)
    }
    if (filters?.vendor_id) {
      queryParams.append('vendor_id', filters.vendor_id)
    }
    if (filters?.sort_by) {
      queryParams.append('sort_by', filters.sort_by)
    }
    if (filters?.sort_dir) {
      queryParams.append('sort_dir', filters.sort_dir)
    }
    if (typeof filters?.limit === 'number') {
      queryParams.append('limit', String(filters.limit))
    }
    if (typeof filters?.offset === 'number') {
      queryParams.append('offset', String(filters.offset))
    } else if (typeof filters?.page === 'number' && typeof filters?.limit === 'number') {
      const pageOffset = Math.max(0, (filters.page - 1) * filters.limit)
      queryParams.append('offset', String(pageOffset))
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
    const url = `${API_ENDPOINT_ADMIN_LICENSES_MARK_REVOKED}/${encodeURIComponent(idOrKey)}/revoke`
    const response = await this.httpClient.post<ApiResponse<{ success: boolean }>>(url, {})

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  /**
   * Move a license to a new domain via the atomic server endpoint. A license's
   * domain is cryptographically bound into its signed key and cannot be edited in
   * place, so the server mints a replacement license bound to `new_domain` (copying
   * the source's product, tier, customer, demo flag, activation limit, remaining
   * paid term, and sanitized metadata) and revokes the source with a supersession
   * pointer to the replacement — all inside a single database transaction. Either
   * both happen or neither does, so there is no partial-failure window that could
   * orphan a replacement or strand the source. A connector still presenting the old
   * key from the new domain self-heals on its next validate.
   */
  async changeLicenseDomain(request: ChangeLicenseDomainRequest): Promise<ChangeLicenseDomainResponse> {
    const { current_license_key, new_domain, reason } = request
    const url = `${API_ENDPOINT_ADMIN_LICENSES_CHANGE_DOMAIN}/${encodeURIComponent(current_license_key)}/change-domain`
    const body: { new_domain: string; reason?: string } = { new_domain }
    if (typeof reason === 'string' && reason.trim() !== '') {
      body.reason = reason
    }

    const response = await this.httpClient.post<ApiResponse<ChangeLicenseDomainResponse>>(url, body)
    return this.handleApiResponse(response.data, {} as ChangeLicenseDomainResponse)
  }

  async softDeleteLicense(idOrKey: string): Promise<ActionSuccessResponse> {
    const url = `${API_ENDPOINT_ADMIN_LICENSES_REVOKE}/${encodeURIComponent(idOrKey)}`
    const response = await this.httpClient.delete<ApiResponse<{ success: boolean }>>(url)

    return this.handleApiResponse<ActionSuccessResponse>(response.data, { success: true })
  }

  async batchSoftDeleteLicenses(request: BatchSoftDeleteLicensesRequest): Promise<BatchOperationResponse> {
    const response = await this.httpClient.post<ApiResponse<BatchOperationResultData>>(
      API_ENDPOINT_ADMIN_LICENSES_BATCH_SOFT_DELETE,
      request
    )
    const data = this.handleApiResponse<BatchOperationResultData>(response.data, {
      deletedCount: 0,
      deleted: [],
      skipped: [],
      failed: [],
      maxBatchSize: 0,
    })
    return { success: true, data }
  }

  async prepareReleaseBatchDelete(
    productId: string,
    inputRows: ListReleasesResponse
  ): Promise<BatchDeleteReleasesRequest> {
    const rows = inputRows.map((row) => ({ ...row }))
    const operations = []
    for (const row of rows) {
      const original = await this.prepareReleaseMaintenance(productId, 'delete', row)
      if (!original.expected) {
        throw new Error('The retained delete precondition is missing.')
      }
      operations.push({
        operationId: original.id,
        expected: original.expected,
        scopeFingerprint: original.scopeFingerprint,
      })
    }
    return { releaseIds: rows.map((row) => row.id), operations }
  }

  async batchDeleteReleases(
    productId: string,
    inputRequest: BatchDeleteReleasesRequest
  ): Promise<BatchOperationResponse> {
    const request: BatchDeleteReleasesRequest = {
      releaseIds: [...inputRequest.releaseIds],
      ...(inputRequest.operations
        ? {
            operations: inputRequest.operations.map((operation) => ({
              ...operation,
              expected: { ...operation.expected },
            })),
          }
        : {}),
    }
    const scope = await this.publicationScope(productId)
    if (
      !request.operations ||
      request.releaseIds.length === 0 ||
      request.releaseIds.length > 100 ||
      request.operations.length !== request.releaseIds.length
    ) {
      throw new Error('Every batch row requires its displayed revision and original delete operation.')
    }
    if (
      new Set(request.releaseIds).size !== request.releaseIds.length ||
      new Set(request.operations.map((operation) => operation.operationId)).size !== request.operations.length ||
      new Set(request.operations.map((operation) => operation.expected.rowId)).size !== request.releaseIds.length
    ) {
      throw new Error('The batch must cover each displayed row exactly once.')
    }
    const originals = request.operations.map((operation) => {
      const original = findReleaseOperation(scope, operation.operationId)
      if (
        !request.releaseIds.includes(operation.expected.rowId) ||
        original.scopeFingerprint !== operation.scopeFingerprint ||
        original.action !== 'delete' ||
        JSON.stringify(original.expected) !== JSON.stringify(operation.expected)
      ) {
        throw new Error('The retained batch intent changed. Check its original operation.')
      }
      return original
    })
    if (originals.some((original) => original.dispatchStarted)) {
      // Do not replay a partially executed batch; each retained row has an independent status route.
      await Promise.all(
        originals
          .filter((original) => original.dispatchStarted)
          .map((original) => this.getReleaseOperationStatus(productId, original.id))
      )
      throw new Error(
        'This batch was already dispatched. Check its original per-row operations; it was not sent again.'
      )
    }
    for (const original of originals) {
      persistReleaseOperation({ ...original, dispatchStarted: true })
    }
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}${API_ENDPOINT_ADMIN_RELEASES_BATCH_DELETE_SUFFIX}`
    const response = await this.httpClient.post<unknown>(url, request, { replayPolicy: 'never' })
    const data = this.handleApiResponse<BatchOperationResultData & { publications?: unknown[] }>(response.data)
    if (
      !Array.isArray(data.publications) ||
      !Array.isArray(data.deleted) ||
      !Array.isArray(data.skipped) ||
      !Array.isArray(data.failed) ||
      !Number.isInteger(data.deletedCount) ||
      !Number.isInteger(data.maxBatchSize) ||
      data.maxBatchSize < request.releaseIds.length ||
      data.maxBatchSize > 100 ||
      data.deleted.some((id) => typeof id !== 'string') ||
      [...data.skipped, ...data.failed].some(
        (item) => !item || typeof item.id !== 'string' || typeof item.reason !== 'string'
      )
    ) {
      throw new Error('The batch outcome is unresolved. Check each original operation.')
    }
    const seen = new Set<string>()
    for (const value of data.publications) {
      const operationId = value && typeof value === 'object' && 'operationId' in value ? value.operationId : null
      const original = originals.find((row) => row.id === operationId)
      if (!original || seen.has(original.id)) {
        throw new Error('The batch receipt does not match its original operations.')
      }
      seen.add(original.id)
      const receipt = validatePublicationReceipt({ success: true, publication: value }, original)
      if (
        data.deleted.includes(String(original.expected?.rowId)) &&
        (receipt.state !== 'TOMBSTONED' || receipt.effect !== 'OBJECT_RETAINED' || receipt.eligible)
      ) {
        throw new Error('A reported deletion lacks its retained tombstone receipt.')
      }
    }
    const resolvedIds = [
      ...(data.deleted ?? []),
      ...(data.skipped ?? []).map((item) => item.id),
      ...(data.failed ?? []).map((item) => item.id),
    ]
    const resolved = new Set(resolvedIds)
    if (
      resolvedIds.length !== request.releaseIds.length ||
      resolved.size !== request.releaseIds.length ||
      request.releaseIds.some((id) => !resolved.has(id)) ||
      data.deletedCount !== data.deleted.length ||
      data.deleted.some((id) => !originals.some((item) => item.expected?.rowId === id && seen.has(item.id)))
    ) {
      throw new Error('The batch coverage is incomplete. Check every original operation.')
    }
    return { success: data.failed.length === 0 && data.skipped.length === 0, data }
  }

  private async postBatchOperation(url: string, body: object): Promise<BatchOperationResponse> {
    const response = await this.httpClient.post<ApiResponse<BatchOperationResultData>>(url, body)
    const data = this.handleApiResponse<BatchOperationResultData>(response.data, {
      deletedCount: 0,
      deleted: [],
      skipped: [],
      failed: [],
      maxBatchSize: 0,
    })
    return { success: true, data }
  }

  async batchDeleteProducts(request: BatchDeleteProductsRequest): Promise<BatchOperationResponse> {
    return this.postBatchOperation(API_ENDPOINT_ADMIN_PRODUCTS_BATCH_DELETE, request)
  }

  async batchSuspendProducts(request: BatchDeleteProductsRequest): Promise<BatchOperationResponse> {
    return this.postBatchOperation(API_ENDPOINT_ADMIN_PRODUCTS_BATCH_SUSPEND, request)
  }

  async batchResumeProducts(request: BatchDeleteProductsRequest): Promise<BatchOperationResponse> {
    return this.postBatchOperation(API_ENDPOINT_ADMIN_PRODUCTS_BATCH_RESUME, request)
  }

  async batchDeleteUsers(request: BatchDeleteUsersRequest): Promise<BatchOperationResponse> {
    return this.postBatchOperation(API_ENDPOINT_ADMIN_USERS_BATCH_DELETE, request)
  }

  async batchSuspendTenants(request: BatchSuspendTenantsRequest): Promise<BatchOperationResponse> {
    return this.postBatchOperation(API_ENDPOINT_ADMIN_TENANTS_BATCH_SUSPEND, request)
  }

  async batchResumeTenants(request: BatchSuspendTenantsRequest): Promise<BatchOperationResponse> {
    return this.postBatchOperation(API_ENDPOINT_ADMIN_TENANTS_BATCH_RESUME, request)
  }

  async batchDeleteProductTiers(
    productId: string,
    request: BatchDeleteProductTiersRequest
  ): Promise<BatchOperationResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}${API_ENDPOINT_ADMIN_PRODUCT_TIERS_BATCH_DELETE_SUFFIX}`
    return this.postBatchOperation(url, request)
  }

  async batchDeleteEntitlements(
    productId: string,
    request: BatchDeleteEntitlementsRequest
  ): Promise<BatchOperationResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}${API_ENDPOINT_ADMIN_ENTITLEMENTS_BATCH_DELETE_SUFFIX}`
    return this.postBatchOperation(url, request)
  }

  async getLicenseActivations(idOrKey: string): Promise<GetLicenseActivationsResponse> {
    const url = `${API_ENDPOINT_ADMIN_LICENSES_ACTIVATIONS}/${encodeURIComponent(idOrKey)}/activations`
    // The admin endpoint returns the activation rows directly as the envelope `data` array,
    // so normalize to the `{ activations }` shape the SDK type and UI consume.
    const response = await this.httpClient.get<ApiResponse<GetLicenseActivationsResponse['activations']>>(url)
    const data = this.handleApiResponse<GetLicenseActivationsResponse['activations'] | GetLicenseActivationsResponse>(
      response.data,
      []
    )

    return { activations: Array.isArray(data) ? data : (data.activations ?? []) }
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

  async listProtectionBuildTokens(productId: string): Promise<ListProtectionBuildTokensResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/protection/build-tokens`
    const response = await this.httpClient.get<ApiResponse<ListProtectionBuildTokensResponse>>(url)
    const rawData = this.handleApiResponse<Record<string, unknown>>(response.data, {})
    return this.normalizeListProtectionBuildTokensResponse(rawData)
  }

  async issueProtectionBuildToken(
    productId: string,
    request: IssueProtectionBuildTokenRequest
  ): Promise<IssueProtectionBuildTokenResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/protection/build-tokens`
    const response = await this.httpClient.post<ApiResponse<IssueProtectionBuildTokenResponse>>(url, request)
    const rawData = this.handleApiResponse<Record<string, unknown>>(response.data, {})
    return this.normalizeIssueProtectionBuildTokenResponse(rawData)
  }

  async revokeProtectionBuildToken(productId: string, tokenId: string): Promise<RevokeProtectionBuildTokenResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/protection/build-tokens/${encodeURIComponent(tokenId)}/revoke`
    const response = await this.httpClient.post<ApiResponse<RevokeProtectionBuildTokenResponse>>(url, {})
    const rawData = this.handleApiResponse<Record<string, unknown>>(response.data, {})
    return this.normalizeRevokeProtectionBuildTokenResponse(rawData)
  }

  async batchRevokeProtectionBuildTokens(
    productId: string,
    request: BatchRevokeProtectionBuildTokensRequest
  ): Promise<BatchOperationResponse> {
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}${API_ENDPOINT_ADMIN_PROTECTION_BUILD_TOKENS_BATCH_REVOKE_SUFFIX}`
    return this.postBatchOperation(url, request)
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
    const rawData = this.handleApiResponse<unknown>(response.data, [])
    return this.normalizeListReleasesResponse(rawData)
  }

  async promoteRelease(
    productId: string,
    releaseId: string,
    operation?: { operationId: string; expected: ReleasePublicationExpected; scopeFingerprint?: string }
  ): Promise<CreateReleaseResponse> {
    if (!operation || operation.expected.rowId !== releaseId) {
      throw new Error('The displayed release revision and retained promotion operation are required.')
    }
    const original = findReleaseOperation(await this.publicationScope(productId), operation.operationId)
    if (
      original.scopeFingerprint !== operation.scopeFingerprint ||
      original.action !== 'promote' ||
      JSON.stringify(original.expected) !== JSON.stringify(operation.expected)
    ) {
      throw new Error('The original promotion intent changed.')
    }
    if (original.dispatchStarted) {
      const result = await this.retainedReleaseResult(productId, original.id)
      if (!result.publication?.eligible) {
        throw new Error('The original promotion is currently ineligible. Check its retained status.')
      }
      return result
    }
    persistReleaseOperation({ ...original, dispatchStarted: true })
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases/${encodeURIComponent(releaseId)}/promote`
    const response = await this.httpClient.patch<unknown>(url, operation, { replayPolicy: 'never' })
    const receipt = validatePublicationReceipt(response.data, original)
    if (receipt.state !== 'READY' || receipt.effect !== 'CONFIRMED' || !receipt.eligible) {
      throw new Error('The promotion outcome remains unresolved. Check its original operation.')
    }
    const raw = this.handleApiResponse<Record<string, unknown>>(response.data)
    return this.publicationRelease(raw, receipt)
  }

  private async publicationIdentity(productId: string): Promise<{ scope: string; actorId: string }> {
    const response = await this.httpClient.get<ApiResponse<GetCurrentUserResponse>>(API_ENDPOINT_ADMIN_USERS_ME, {
      replayPolicy: 'never',
    })
    const identity = this.handleApiResponse<GetCurrentUserResponse>(response.data)
    return { scope: releaseOperationScope(this.baseUrl, identity.user.id, productId), actorId: identity.user.id }
  }

  private async publicationScope(productId: string): Promise<string> {
    return (await this.publicationIdentity(productId)).scope
  }

  private async readPublicationContext(
    productId: string,
    actorId: string,
    operationId: string,
    fileName: string,
    version: string,
    isPrerelease: boolean,
    action = 'create',
    expected?: ReleasePublicationExpected
  ): Promise<unknown> {
    const query = new URLSearchParams({ operationId, fileName, version, isPrerelease: String(isPrerelease), action })
    if (expected) {
      query.set('expected', JSON.stringify(expected))
    }
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases/publication-context?${query}`
    const response = await this.httpClient.get<unknown>(url, { replayPolicy: 'never' })
    const envelope = response.data as { success?: unknown; context?: { actorId?: unknown } }
    if (envelope?.success !== true || envelope.context?.actorId !== actorId) {
      throw new Error('The publication principal changed. No new action was dispatched.')
    }
    return envelope.context
  }

  private snapshotPublicationForm(input: FormData): FormData {
    const snapshot = new FormData()
    const seen = new Set<string>()
    input.forEach((value, key) => {
      if (seen.has(key)) {
        throw new Error('Every release field must occur exactly once.')
      }
      seen.add(key)
      snapshot.append(key, value)
    })
    return snapshot
  }

  private publicationMultipart(original: ReleaseOperationRecord, input: FormData): FormData {
    const file = input.get('file')
    if (!(file instanceof File) || file.name !== original.fileName || file.size !== original.sizeBytes) {
      throw new Error('The frozen original artifact is required.')
    }
    const form = new FormData()
    form.set('file', file)
    form.set('version', original.version)
    form.set('operationId', original.id)
    form.set('scopeFingerprint', original.scopeFingerprint ?? '')
    form.set('fileSha256', original.sha256)
    if (original.expected) {
      form.set('expected', JSON.stringify(original.expected))
    }
    if (original.action === 'create') {
      for (const key of ['changelogMd', 'requiredTier', 'minWpVersion', 'testedWpVersion', 'isPrerelease']) {
        const value = original.metadata?.[key]
        if (value !== null && value !== undefined) {
          form.set(key, String(value))
        }
      }
    }
    return form
  }

  private retainPreparedFormIdentity(target: FormData, prepared: FormData): void {
    for (const key of ['operationId', 'scopeFingerprint', 'fileSha256', 'expected']) {
      const value = prepared.get(key)
      if (typeof value === 'string') {
        target.set(key, value)
      }
    }
  }

  async prepareReleaseOperation(productId: string, formData: FormData): Promise<ReleaseOperationRecord> {
    const snapshot = this.snapshotPublicationForm(formData)
    const allowed = new Set([
      'file',
      'version',
      'operationId',
      'scopeFingerprint',
      'fileSha256',
      'changelogMd',
      'requiredTier',
      'minWpVersion',
      'testedWpVersion',
      'isPrerelease',
    ])
    snapshot.forEach((_value, key) => {
      if (!allowed.has(key)) {
        throw new Error('Unsupported Admin creation field; no operation was dispatched.')
      }
    })
    const identity = await this.publicationIdentity(productId)
    const original = await prepareCreateReleaseOperation(identity.scope, productId, snapshot, (...args) =>
      this.readPublicationContext(productId, identity.actorId, ...args)
    )
    this.retainPreparedFormIdentity(formData, snapshot)
    return original
  }

  async repairReleaseMissing(
    productId: string,
    inputRow: ListReleasesResponse[number],
    formData: FormData
  ): Promise<CreateReleaseResponse> {
    const snapshot = this.snapshotPublicationForm(formData)
    const row = { ...inputRow }
    const identity = await this.publicationIdentity(productId)
    const original = await prepareRepairReleaseOperation(identity.scope, productId, snapshot, row, (...args) =>
      this.readPublicationContext(productId, identity.actorId, ...args)
    )
    if (original.dispatchStarted) {
      return this.retainedReleaseResult(productId, original.id)
    }
    snapshot.set('operationId', original.id)
    snapshot.set('scopeFingerprint', original.scopeFingerprint ?? '')
    snapshot.set('expected', JSON.stringify(original.expected))
    this.retainPreparedFormIdentity(formData, snapshot)
    persistReleaseOperation({ ...original, dispatchStarted: true })
    const response = await this.httpClient.postFormData<unknown>(
      `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases/${encodeURIComponent(row.id)}/repair-missing`,
      this.publicationMultipart(original, snapshot),
      { timeout: RELEASE_UPLOAD_REQUEST_TIMEOUT_MS, replayPolicy: 'never' }
    )
    const receipt = validatePublicationReceipt(response.data, original)
    if (receipt.state !== 'READY' || receipt.effect !== 'CONFIRMED') {
      throw new Error('The repair remains unresolved. Check the original operation.')
    }
    return this.publicationRelease(this.handleApiResponse<Record<string, unknown>>(response.data), receipt)
  }

  async resumePreparedReleaseMaintenance(productId: string, operationId: string): Promise<ReleasePublicationReceipt> {
    const identity = await this.publicationIdentity(productId)
    const original = findReleaseOperation(identity.scope, operationId)
    if (!original.expected || (original.action !== 'promote' && original.action !== 'delete')) {
      throw new Error('The original maintenance operation is required.')
    }
    if (original.dispatchStarted) {
      return this.getReleaseOperationStatus(productId, operationId)
    }
    const row = (await this.listReleases(productId)).find((item) => item.id === original.expected?.rowId)
    if (
      !row ||
      row.version !== original.version ||
      row.fileName !== original.fileName ||
      row.publicationRevision !== original.expected.revision ||
      row.publicationState !== original.expected.state ||
      row.objectBindingFingerprint !== original.expected.objectBindingFingerprint
    ) {
      throw new Error('The retained maintenance precondition changed. No action was dispatched.')
    }
    verifyPreparedMaintenanceContext(
      original,
      await this.readPublicationContext(
        productId,
        identity.actorId,
        original.id,
        original.fileName,
        original.version,
        row.isPrerelease,
        original.action,
        original.expected
      )
    )
    const operation = {
      operationId: original.id,
      expected: original.expected,
      scopeFingerprint: original.scopeFingerprint ?? '',
    }
    if (original.action === 'promote') {
      await this.promoteRelease(productId, row.id, operation)
    } else {
      await this.deleteRelease(productId, row.id, operation)
    }
    return this.getReleaseOperationStatus(productId, original.id)
  }

  async resumePreparedReleaseOperation(
    productId: string,
    operationId: string,
    file: File
  ): Promise<CreateReleaseResponse> {
    const original = findReleaseOperation(await this.publicationScope(productId), operationId)
    if (original.dispatchStarted) {
      return this.retainedReleaseResult(productId, original.id)
    }
    if (!original.metadata || (original.action !== 'create' && original.action !== 'repair-missing')) {
      throw new Error('This original operation cannot be resumed with an upload. Check status instead.')
    }
    const form = new FormData()
    form.set('operationId', original.id)
    form.set('version', original.version)
    form.set('file', file)
    for (const [key, value] of Object.entries(original.metadata)) {
      if (
        value !== null &&
        (original.action !== 'create' ||
          ['changelogMd', 'requiredTier', 'minWpVersion', 'testedWpVersion', 'isPrerelease'].includes(key))
      ) {
        form.set(key, String(value))
      }
    }
    if (original.action === 'create') {
      return this.createRelease(productId, form)
    }
    const row = (await this.listReleases(productId)).find((item) => item.id === original.expected?.rowId)
    if (!row || row.publicationRevision !== original.expected?.revision) {
      throw new Error('The displayed repair revision changed. Keep its original operation ID.')
    }
    return this.repairReleaseMissing(productId, row, form)
  }

  private publicationRelease(raw: Record<string, unknown>, receipt: ReleasePublicationReceipt): CreateReleaseResponse {
    const row = this.normalizePluginRelease(raw)
    if (
      row.id !== receipt.rowId ||
      row.slug !== receipt.slug ||
      row.version !== receipt.version ||
      row.fileName !== receipt.fileName ||
      row.sizeBytes !== receipt.sizeBytes ||
      row.fileSha256 !== receipt.sha256 ||
      row.publicationRevision !== receipt.rowRevision ||
      row.objectBindingFingerprint !== receipt.objectBindingFingerprint ||
      ((receipt.action === 'create' || receipt.action === 'repair-missing') &&
        row.publicationOperationId !== receipt.operationId)
    ) {
      throw new Error('The release payload does not match its original receipt. Check the retained operation.')
    }
    return { ...row, publication: receipt }
  }

  private async retainedReleaseResult(productId: string, operationId: string): Promise<CreateReleaseResponse> {
    const receipt = await this.getReleaseOperationStatus(productId, operationId)
    if (receipt.state !== 'READY' || receipt.effect !== 'CONFIRMED' || !receipt.rowId) {
      throw new Error('The original operation remains unresolved. Check its retained status.')
    }
    const row = (await this.listReleases(productId)).find((item) => item.id === receipt.rowId)
    if (!row) {
      throw new Error('The original committed row is unavailable. Keep its operation ID.')
    }
    return this.publicationRelease(row as unknown as Record<string, unknown>, receipt)
  }

  async retainedReleaseOperations(productId: string): Promise<ReleaseOperationRecord[]> {
    return listReleaseOperations(await this.publicationScope(productId))
  }

  async getReleaseOperationStatus(productId: string, operationId: string): Promise<ReleasePublicationReceipt> {
    const original = findReleaseOperation(await this.publicationScope(productId), operationId)
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases/operations/${encodeURIComponent(operationId)}`
    const response = await this.httpClient.get<unknown>(url, { replayPolicy: 'never' })
    return validatePublicationReceipt(response.data, original)
  }

  async reconcileReleaseOperation(productId: string, operationId: string): Promise<ReleasePublicationReceipt> {
    const original = findReleaseOperation(await this.publicationScope(productId), operationId)
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases/operations/${encodeURIComponent(operationId)}/reconcile`
    const response = await this.httpClient.post<unknown>(url, {}, { replayPolicy: 'never' })
    return validatePublicationReceipt(response.data, original)
  }

  async prepareReleaseMaintenance(
    productId: string,
    action: 'delete' | 'promote',
    inputRow: ListReleasesResponse[number]
  ): Promise<ReleaseOperationRecord> {
    const row = { ...inputRow }
    const identity = await this.publicationIdentity(productId)
    return prepareReleaseMaintenance(identity.scope, productId, action, row, (...args) =>
      this.readPublicationContext(productId, identity.actorId, ...args)
    )
  }

  async createRelease(productId: string, formData: FormData): Promise<CreateReleaseResponse> {
    const snapshot = this.snapshotPublicationForm(formData)
    const original = await this.prepareReleaseOperation(productId, snapshot)
    this.retainPreparedFormIdentity(formData, snapshot)
    if (original.dispatchStarted) {
      const receipt = await this.getReleaseOperationStatus(productId, original.id)
      if (receipt.state !== 'READY' || receipt.effect !== 'CONFIRMED' || !receipt.rowId) {
        throw new Error('The original upload remains unresolved. Check its retained operation status.')
      }
      const rows = await this.listReleases(productId)
      const retained = rows.find((row) => row.id === receipt.rowId)
      if (!retained) {
        throw new Error('The original committed row is unavailable. Keep the operation ID.')
      }
      return this.publicationRelease(retained as unknown as Record<string, unknown>, receipt)
    }
    persistReleaseOperation({ ...original, dispatchStarted: true })
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases`
    const response = await this.httpClient.postFormData<unknown>(url, this.publicationMultipart(original, snapshot), {
      timeout: RELEASE_UPLOAD_REQUEST_TIMEOUT_MS,
      replayPolicy: 'never',
    })
    const receipt = validatePublicationReceipt(response.data, original)
    if (receipt.state !== 'READY' || receipt.effect !== 'CONFIRMED') {
      throw new Error('The original upload remains unresolved. Check its retained operation status.')
    }
    const raw = this.handleApiResponse<Record<string, unknown>>(response.data)
    return this.publicationRelease(raw, receipt)
  }

  async deleteRelease(
    productId: string,
    releaseId: string,
    operation?: { operationId: string; expected: ReleasePublicationExpected; scopeFingerprint?: string }
  ): Promise<{ success: boolean; data: { id: string } }> {
    if (!operation || operation.expected.rowId !== releaseId) {
      throw new Error('The displayed release revision and retained delete operation are required.')
    }
    const original = findReleaseOperation(await this.publicationScope(productId), operation.operationId)
    if (
      original.scopeFingerprint !== operation.scopeFingerprint ||
      original.action !== 'delete' ||
      JSON.stringify(original.expected) !== JSON.stringify(operation.expected)
    ) {
      throw new Error('The original delete intent changed.')
    }
    if (original.dispatchStarted) {
      const receipt = await this.getReleaseOperationStatus(productId, original.id)
      if (receipt.state !== 'TOMBSTONED' || receipt.effect !== 'OBJECT_RETAINED') {
        throw new Error('The original delete remains unresolved. Check status.')
      }
      return { success: true, data: { id: releaseId } }
    }
    persistReleaseOperation({ ...original, dispatchStarted: true })
    const url = `${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases/${encodeURIComponent(releaseId)}`
    const response = await this.httpClient.delete<unknown>(url, { replayPolicy: 'never', data: operation })
    const receipt = validatePublicationReceipt(response.data, original)
    if (receipt.state !== 'TOMBSTONED' || receipt.effect !== 'OBJECT_RETAINED') {
      throw new Error('Delete outcome remains unresolved. The retained object has not been reported removed.')
    }
    return { success: true, data: { id: releaseId } }
  }

  getReleaseDownloadUrl(productId: string, releaseId: string): string {
    return `${this.baseUrl}${API_ENDPOINT_ADMIN_PRODUCTS_LIST}/${encodeURIComponent(productId)}/releases/${encodeURIComponent(releaseId)}/download`
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
    } else if (typeof filters?.page === 'number' && typeof filters?.limit === 'number') {
      const pageOffset = Math.max(0, (filters.page - 1) * filters.limit)
      queryParams.append('offset', String(pageOffset))
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

  async resetUserPassword(id: string, request: ResetUserPasswordRequest): Promise<ResetUserPasswordResponse> {
    const url = `${API_ENDPOINT_ADMIN_USERS_RESET_PASSWORD}/${encodeURIComponent(id)}${API_ENDPOINT_ADMIN_USERS_RESET_PASSWORD_SUFFIX}`
    const response = await this.httpClient.post<ApiResponse<ResetUserPasswordResponse>>(url, request)

    return this.handleApiResponse<ResetUserPasswordResponse>(response.data, { success: true })
  }

  async setServiceAccountPassword(
    id: string,
    request: SetServiceAccountPasswordRequest
  ): Promise<SetServiceAccountPasswordResponse> {
    const url = `${API_ENDPOINT_ADMIN_USERS_SET_SERVICE_PASSWORD}/${encodeURIComponent(id)}${API_ENDPOINT_ADMIN_USERS_SET_SERVICE_PASSWORD_SUFFIX}`
    const response = await this.httpClient.post<ApiResponse<SetServiceAccountPasswordResponse>>(url, request)

    return this.handleApiResponse<SetServiceAccountPasswordResponse>(response.data, { success: true })
  }

  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    const response = await this.httpClient.get<ApiResponse<GetCurrentUserResponse>>(API_ENDPOINT_ADMIN_USERS_ME)

    return this.handleApiResponse(response.data, {} as GetCurrentUserResponse)
  }

  async listAgentServiceAccounts(vendorId?: string): Promise<AgentServiceAccount[]> {
    const queryParams = new URLSearchParams()
    if (typeof vendorId === 'string' && vendorId.trim().length > 0) {
      queryParams.append('vendorId', vendorId)
    }

    const url =
      queryParams.size > 0
        ? `${API_ENDPOINT_ADMIN_AGENT_SERVICE_ACCOUNTS}?${queryParams.toString()}`
        : API_ENDPOINT_ADMIN_AGENT_SERVICE_ACCOUNTS
    const response = await this.httpClient.get<ApiResponse<AgentServiceAccount[]>>(url)
    return this.handleApiResponse(response.data, [] as AgentServiceAccount[])
  }

  async createAgentServiceAccount(
    request: CreateAgentServiceAccountRequest
  ): Promise<CreateAgentServiceAccountResponse> {
    const response = await this.httpClient.post<ApiResponse<AgentServiceAccount>>(
      API_ENDPOINT_ADMIN_AGENT_SERVICE_ACCOUNTS,
      request
    )

    return {
      success: true,
      data: this.handleApiResponse(response.data, {} as AgentServiceAccount),
    }
  }

  async updateAgentServiceAccount(
    serviceAccountId: string,
    request: UpdateAgentServiceAccountRequest
  ): Promise<UpdateAgentServiceAccountResponse> {
    const url = `${API_ENDPOINT_ADMIN_AGENT_SERVICE_ACCOUNTS}/${encodeURIComponent(serviceAccountId)}`
    const response = await this.httpClient.put<ApiResponse<AgentServiceAccount>>(url, request)

    return {
      success: true,
      data: this.handleApiResponse(response.data, {} as AgentServiceAccount),
    }
  }

  async issueAgentServiceCredential(
    serviceAccountId: string,
    request: IssueAgentServiceCredentialRequest
  ): Promise<IssueAgentServiceCredentialResponse> {
    const url = `${API_ENDPOINT_ADMIN_AGENT_SERVICE_ACCOUNTS}/${encodeURIComponent(serviceAccountId)}${API_ENDPOINT_ADMIN_AGENT_CREDENTIALS_SUFFIX}`
    const response = await this.httpClient.post<ApiResponse<IssueAgentServiceCredentialResponse['data']>>(url, request)

    return {
      success: true,
      data: this.handleApiResponse(response.data, {} as IssueAgentServiceCredentialResponse['data']),
    }
  }

  async revokeAgentServiceCredential(credentialId: string): Promise<RevokeAgentServiceCredentialResponse> {
    const url = `${API_ENDPOINT_ADMIN_AGENT_SERVICE_ACCOUNTS}/credentials/${encodeURIComponent(credentialId)}${API_ENDPOINT_ADMIN_AGENT_CREDENTIAL_REVOKE_SUFFIX}`
    const response = await this.httpClient.post<ApiResponse<RevokeAgentServiceCredentialResponse['data']>>(url)

    return {
      success: true,
      data: this.handleApiResponse(response.data, {} as RevokeAgentServiceCredentialResponse['data']),
    }
  }

  async batchRevokeAgentServiceCredentials(
    request: BatchRevokeAgentCredentialsRequest
  ): Promise<BatchOperationResponse> {
    const url = `${API_ENDPOINT_ADMIN_AGENT_SERVICE_ACCOUNTS}${API_ENDPOINT_ADMIN_AGENT_CREDENTIALS_BATCH_REVOKE_SUFFIX}`
    return this.postBatchOperation(url, request)
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
  async getEmailDeliveryStatus(): Promise<EmailDeliveryStatus> {
    try {
      const response = await this.httpClient.get<unknown>(API_ENDPOINT_ADMIN_EMAIL_STATUS)
      return parseEmailDeliveryStatus(response.data)
    } catch {
      throw new ApiException(EMAIL_STATUS_UNAVAILABLE, EMAIL_STATUS_UNAVAILABLE)
    }
  }

  async sendEmailDeliveryTest(): Promise<EmailTestResult> {
    try {
      // An explicit click confirms a fixed message to the current operator. Inspect
      // every HTTP result directly: even auth refresh must not replay this send.
      const response = await this.httpClient.post<unknown>(
        API_ENDPOINT_ADMIN_EMAIL_TEST,
        { confirm: true },
        {
          timeout: EMAIL_TEST_REQUEST_TIMEOUT_MS,
          validateStatus: () => true,
        }
      )
      return parseEmailTestResult(response.data, response.status)
    } catch {
      return { ok: false, code: EMAIL_OUTCOME_UNKNOWN }
    }
  }

  async getServerStatus(): Promise<ServerStatusResponse> {
    const response = await this.httpClient.get<ApiResponse<ServerStatusResponse>>(API_ENDPOINT_ADMIN_STATUS)

    return this.handleApiResponse(response.data, {} as ServerStatusResponse)
  }

  async getHealthMetrics(): Promise<HealthMetricsResponse> {
    const response = await this.httpClient.get<ApiResponse<HealthMetricsResponse>>(API_ENDPOINT_ADMIN_HEALTH)

    return this.handleApiResponse(response.data, {} as HealthMetricsResponse)
  }

  async getHealthSnapshot(): Promise<HealthSnapshotResponse> {
    const response = await this.httpClient.get<ApiResponse<HealthSnapshotResponse>>(API_ENDPOINT_ADMIN_HEALTH_SNAPSHOT)

    return this.handleApiResponse(response.data, {} as HealthSnapshotResponse)
  }

  async getSystemMetrics(): Promise<MetricsResponse> {
    const response = await this.httpClient.get<ApiResponse<MetricsResponse>>(API_ENDPOINT_ADMIN_METRICS)

    return this.handleApiResponse(response.data, {} as MetricsResponse)
  }

  // Admin API - Analytics
  async getDashboardSnapshot(): Promise<DashboardSnapshotResponse> {
    const response = await this.httpClient.get<ApiResponse<DashboardSnapshotResponse>>(
      API_ENDPOINT_ADMIN_DASHBOARD_SNAPSHOT
    )
    const raw = this.handleApiResponse<Record<string, unknown>>(response.data, {})
    return this.normalizeDashboardSnapshotResponse(raw)
  }

  /**
   * Normalize each embedded slice of the dashboard snapshot through the same
   * normalizer the corresponding individual getter uses.
   *
   * Why this matters: `DashboardRoute` pre-hydrates each per-panel React Query
   * cache (`adminAnalytics.stats()`, `adminAnalytics.usage()`, etc.) with the
   * matching slice from this snapshot so panels render instantly without each
   * one issuing a separate request. If we hydrate with un-normalized server
   * shapes (snake_case vs camelCase vs un-wrapped) the consuming panels read
   * `undefined` and fall back to their empty-state UI. The first Refresh click
   * then fires `getSystemStats()` / `getUsageSummaries()` directly, those DO
   * normalize, and the panel suddenly populates — which is the exact
   * "doesn't populate until I hit refresh" symptom users see.
   *
   * Slices without a dedicated normalizer (distribution, topLicenses,
   * thresholds) are passed through; their type definitions already match the
   * server's canonical shape today. If that ever drifts, add a normalizer
   * here rather than fixing it in two places.
   */
  private normalizeDashboardSnapshotResponse(source: Record<string, unknown>): DashboardSnapshotResponse {
    const statsSlice = (source.stats ?? {}) as Record<string, unknown>
    const usageSlice = source.usage
    const trendsSlice = source.trends
    const distributionSlice = source.distribution as ActivationDistributionResponse | undefined
    const topLicensesSlice = source.topLicenses as TopLicensesResponse | undefined
    const thresholdsSlice = source.thresholds as AlertThresholdsResponse | undefined

    return {
      stats: this.normalizeSystemStatsResponse(statsSlice),
      usage: this.normalizeUsageSummariesResponse(usageSlice),
      trends: this.normalizeUsageTrendsResponse(trendsSlice),
      distribution: distributionSlice ?? ({} as ActivationDistributionResponse),
      topLicenses: topLicensesSlice ?? ({} as TopLicensesResponse),
      thresholds: thresholdsSlice ?? ({} as AlertThresholdsResponse),
    }
  }

  async getSystemStats(): Promise<SystemStatsResponse> {
    const response = await this.httpClient.get<ApiResponse<SystemStatsResponse>>(API_ENDPOINT_ADMIN_STATS)
    const rawData = this.handleApiResponse<Record<string, unknown>>(response.data, {})
    return this.normalizeSystemStatsResponse(rawData)
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
    const rawData = this.handleApiResponse<unknown>(response.data, {})
    return this.normalizeUsageSummariesResponse(rawData)
  }

  async getUsageTrends(): Promise<UsageTrendsResponse> {
    const response = await this.httpClient.get<ApiResponse<UsageTrendsResponse>>(API_ENDPOINT_ADMIN_ANALYTICS_TRENDS)
    const rawData = this.handleApiResponse<unknown>(response.data, {})

    return this.normalizeUsageTrendsResponse(rawData)
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
    if (filters?.sortBy) {
      queryParams.append('sortBy', filters.sortBy)
    }
    if (filters?.sortDirection) {
      queryParams.append('sortDirection', filters.sortDirection)
    }

    const url =
      queryParams.size > 0
        ? `${API_ENDPOINT_ADMIN_AUDIT_LOGS}?${queryParams.toString()}`
        : API_ENDPOINT_ADMIN_AUDIT_LOGS

    const response = await this.httpClient.get<ApiResponse<GetAuditLogsResponse>>(url)
    const rawData = this.handleApiResponse<unknown>(response.data, {})

    return this.normalizeAuditLogsResponse(rawData)
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
  private normalizeSystemStatsResponse(source: Record<string, unknown>): SystemStatsResponse {
    const nestedStatsCandidate = this.getRecordProperty(source, 'stats', 'stats')
    const statsSource = nestedStatsCandidate ?? source

    const activeLicenses = this.toSafeNumber(statsSource.active_licenses ?? statsSource.activeLicenses)
    const expiredLicenses = this.toSafeNumber(statsSource.expired_licenses ?? statsSource.expiredLicenses)
    const totalCustomers = this.toSafeNumber(
      statsSource.total_customers ??
        statsSource.totalCustomers ??
        statsSource.unique_customers ??
        statsSource.uniqueCustomers
    )
    const totalActivations = this.toSafeNumber(statsSource.total_activations ?? statsSource.totalActivations)

    return {
      stats: {
        active_licenses: activeLicenses,
        expired_licenses: expiredLicenses,
        total_customers: totalCustomers,
        total_activations: totalActivations,
      },
    }
  }

  private normalizeUsageSummariesResponse(source: unknown): UsageSummaryResponse {
    if (Array.isArray(source)) {
      return { summaries: source as UsageSummaryResponse['summaries'] }
    }

    if (typeof source !== 'object' || source === null) {
      return { summaries: [] }
    }

    const sourceRecord = source as Record<string, unknown>
    const summaries = sourceRecord.summaries
    if (Array.isArray(summaries)) {
      return { summaries: summaries as UsageSummaryResponse['summaries'] }
    }

    return { summaries: [] }
  }

  private normalizeUsageTrendsResponse(source: unknown): UsageTrendsResponse {
    if (Array.isArray(source)) {
      return {
        periodStart: '',
        periodEnd: '',
        groupBy: 'day',
        trends: this.normalizeUsageTrendRows(source),
      }
    }

    if (typeof source !== 'object' || source === null) {
      return {
        periodStart: '',
        periodEnd: '',
        groupBy: 'day',
        trends: [],
      }
    }

    const sourceRecord = source as Record<string, unknown>
    const trends = this.normalizeUsageTrendRows(Array.isArray(sourceRecord.trends) ? sourceRecord.trends : [])

    return {
      periodStart: this.getStringProperty(sourceRecord, 'period_start', 'periodStart'),
      periodEnd: this.getStringProperty(sourceRecord, 'period_end', 'periodEnd'),
      groupBy: this.getStringProperty(sourceRecord, 'group_by', 'groupBy') || 'day',
      trends,
    }
  }

  private normalizeUsageTrendRows(source: unknown[]): UsageTrendsResponse['trends'] {
    return source
      .filter((trend): trend is Record<string, unknown> => typeof trend === 'object' && trend !== null)
      .map((trend) => ({
        period: this.getStringProperty(trend, 'period', 'period'),
        totalActivations: this.toSafeNumber(trend.total_activations ?? trend.totalActivations),
        totalValidations: this.toSafeNumber(trend.total_validations ?? trend.totalValidations),
        totalUsageReports: this.toSafeNumber(trend.total_usage_reports ?? trend.totalUsageReports),
        uniqueDomains: this.toSafeNumber(trend.unique_domains ?? trend.uniqueDomains),
        uniqueIPs: this.toSafeNumber(trend.unique_ips ?? trend.uniqueIPs),
        peakConcurrency: this.toSafeNumber(trend.peak_concurrency ?? trend.peakConcurrency),
      }))
  }

  private normalizeAuditLogsResponse(source: unknown): GetAuditLogsResponse {
    if (typeof source !== 'object' || source === null) {
      return { logs: [], total: 0 }
    }

    const sourceRecord = source as Record<string, unknown>
    const rawLogs = Array.isArray(sourceRecord.logs) ? sourceRecord.logs : []

    return {
      logs: rawLogs
        .filter((log): log is Record<string, unknown> => typeof log === 'object' && log !== null)
        .map((log) => this.normalizeAuditLogEntry(log)),
      total: this.toSafeNumber(sourceRecord.total),
    }
  }

  private normalizeAuditLogEntry(source: Record<string, unknown>): AuditLogEntry {
    return {
      id: this.getStringProperty(source, 'id', 'id'),
      adminId: this.getNullableStringProperty(source, 'admin_id', 'adminId'),
      adminUsername: this.getNullableStringProperty(source, 'admin_username', 'adminUsername'),
      vendorId: this.getNullableStringProperty(source, 'vendor_id', 'vendorId'),
      action: this.getStringProperty(source, 'action', 'action'),
      resourceType: this.getStringProperty(source, 'resource_type', 'resourceType'),
      resourceId: this.getNullableStringProperty(source, 'resource_id', 'resourceId'),
      details: this.getRecordProperty(source, 'details', 'details'),
      ipAddress: this.getNullableStringProperty(source, 'ip_address', 'ipAddress'),
      userAgent: this.getNullableStringProperty(source, 'user_agent', 'userAgent'),
      accessMethod: this.getStringProperty(source, 'access_method', 'accessMethod'),
      unixUser: this.getNullableStringProperty(source, 'unix_user', 'unixUser'),
      createdAt: this.getStringProperty(source, 'created_at', 'createdAt'),
    }
  }

  private normalizeListReleasesResponse(source: unknown): ListReleasesResponse {
    if (!Array.isArray(source)) {
      return []
    }

    return source
      .filter((release): release is Record<string, unknown> => typeof release === 'object' && release !== null)
      .map((release) => this.normalizePluginRelease(release))
  }

  private normalizePluginRelease(source: Record<string, unknown>): ListReleasesResponse[number] {
    const normalizedCreatedAt =
      this.getDateProperty(source, 'created_at', 'createdAt') || this.getDateProperty(source, 'created', 'created')
    const normalizedUpdatedAt =
      this.getDateProperty(source, 'updated_at', 'updatedAt') || this.getDateProperty(source, 'updated', 'updated')

    return {
      fileSha256: this.getNullableStringProperty(source, 'file_sha256', 'fileSha256'),
      artifactTrust: this.getStringProperty(source, 'artifact_trust', 'artifactTrust'),
      artifactManifest: this.getNullableStringProperty(source, 'artifact_manifest', 'artifactManifest'),
      ...(Number.isSafeInteger(source.artifactManifestVersion)
        ? { artifactManifestVersion: Number(source.artifactManifestVersion) }
        : {}),
      artifactSignature: this.getNullableStringProperty(source, 'artifact_signature', 'artifactSignature'),
      artifactSignatureAlgorithm: this.getNullableStringProperty(
        source,
        'artifact_signature_algorithm',
        'artifactSignatureAlgorithm'
      ),
      artifactSigningKeyId: this.getNullableStringProperty(source, 'artifact_signing_key_id', 'artifactSigningKeyId'),
      publicationState: this.getStringProperty(source, 'publication_state', 'publicationState'),
      ...(Number.isSafeInteger(source.publication_revision ?? source.publicationRevision)
        ? { publicationRevision: Number(source.publication_revision ?? source.publicationRevision) }
        : {}),
      publicationOperationId: this.getNullableStringProperty(
        source,
        'publication_operation_id',
        'publicationOperationId'
      ),
      objectBindingFingerprint: this.getNullableStringProperty(
        source,
        'object_binding_fingerprint',
        'objectBindingFingerprint'
      ),
      liveProtectionEpoch: this.getNullableStringProperty(source, 'live_protection_epoch', 'liveProtectionEpoch'),
      id: this.getStringProperty(source, 'id', 'id'),
      slug: this.getStringProperty(source, 'slug', 'slug'),
      version: this.getStringProperty(source, 'version', 'version'),
      fileName: this.getStringProperty(source, 'file_name', 'fileName'),
      sizeBytes: this.toSafeNumber(source.size_bytes ?? source.sizeBytes),
      changelogMd: this.getNullableStringProperty(source, 'changelog_md', 'changelogMd'),
      requiredTier: this.getNullableStringProperty(source, 'required_tier', 'requiredTier'),
      minWpVersion: this.getNullableStringProperty(source, 'min_wp_version', 'minWpVersion'),
      testedWpVersion: this.getNullableStringProperty(source, 'tested_wp_version', 'testedWpVersion'),
      isPrerelease: this.toSafeBoolean(source.is_prerelease ?? source.isPrerelease),
      isPromoted: this.toSafeBoolean(source.is_promoted ?? source.isPromoted),
      createdAt: normalizedCreatedAt,
      updatedAt: normalizedUpdatedAt,
    }
  }

  private getDateProperty(source: Record<string, unknown>, snakeCaseKey: string, camelCaseKey: string): string {
    const snakeCaseValue = this.toDateString(source[snakeCaseKey])
    if (snakeCaseValue !== '') {
      return snakeCaseValue
    }
    return this.toDateString(source[camelCaseKey])
  }

  private toDateString(value: unknown): string {
    if (typeof value === 'string') {
      return value
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return ''
    }
    const epochMilliseconds = value < 1_000_000_000_000 ? value * 1_000 : value
    const parsedDate = new Date(epochMilliseconds)
    if (Number.isNaN(parsedDate.getTime())) {
      return ''
    }
    return parsedDate.toISOString()
  }

  private toSafeNumber(value: unknown): number {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value
    }

    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }

    return 0
  }

  private toSafeBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'string') {
      const lowered = value.toLowerCase()
      if (lowered === 'true') {
        return true
      }
      if (lowered === 'false') {
        return false
      }
    }

    if (typeof value === 'number') {
      return value > 0
    }

    return false
  }

  private getRecordProperty(
    source: Record<string, unknown>,
    snakeCaseKey: string,
    camelCaseKey: string
  ): Record<string, unknown> | null {
    const snakeCaseValue = source[snakeCaseKey]
    if (typeof snakeCaseValue === 'object' && snakeCaseValue !== null && !Array.isArray(snakeCaseValue)) {
      return snakeCaseValue as Record<string, unknown>
    }

    const camelCaseValue = source[camelCaseKey]
    if (typeof camelCaseValue === 'object' && camelCaseValue !== null && !Array.isArray(camelCaseValue)) {
      return camelCaseValue as Record<string, unknown>
    }

    return null
  }

  private getArrayProperty(source: Record<string, unknown>, key: string): unknown[] {
    const value = source[key]
    return Array.isArray(value) ? value : []
  }

  private getStringProperty(source: Record<string, unknown>, snakeCaseKey: string, camelCaseKey: string): string {
    const snakeCaseValue = source[snakeCaseKey]
    if (typeof snakeCaseValue === 'string') {
      return snakeCaseValue
    }

    const camelCaseValue = source[camelCaseKey]
    if (typeof camelCaseValue === 'string') {
      return camelCaseValue
    }

    return ''
  }

  private getNullableStringProperty(
    source: Record<string, unknown>,
    snakeCaseKey: string,
    camelCaseKey: string
  ): string | null {
    const snakeCaseValue = source[snakeCaseKey]
    if (snakeCaseValue === null) {
      return null
    }
    if (typeof snakeCaseValue === 'string') {
      return snakeCaseValue
    }

    const camelCaseValue = source[camelCaseKey]
    if (camelCaseValue === null) {
      return null
    }
    if (typeof camelCaseValue === 'string') {
      return camelCaseValue
    }

    return null
  }

  private assertRequiredString(value: string, fieldName: string): string {
    if (value.trim().length > 0) {
      return value
    }

    throw new ApiException(`API response missing required field: ${fieldName}`, 'INVALID_RESPONSE')
  }

  private normalizeProtectionSigningPublicKeyResponse(
    source: Record<string, unknown>
  ): ProtectionSigningPublicKeyResponse {
    const productSlug = this.assertRequiredString(
      this.getStringProperty(source, 'product_slug', 'productSlug'),
      'product_slug'
    )
    const signingKeyId = this.assertRequiredString(
      this.getStringProperty(source, 'signing_key_id', 'signingKeyId'),
      'signing_key_id'
    )
    const publicKey = this.assertRequiredString(this.getStringProperty(source, 'public_key', 'publicKey'), 'public_key')

    return {
      product_slug: productSlug,
      signing_key_id: signingKeyId,
      public_key: publicKey,
    }
  }

  private normalizeProtectionBuildTokenMetadata(source: Record<string, unknown>): ProtectionBuildTokenMetadata {
    return {
      id: this.assertRequiredString(this.getStringProperty(source, 'id', 'id'), 'id'),
      product_id: this.assertRequiredString(this.getStringProperty(source, 'product_id', 'productId'), 'product_id'),
      product_slug: this.assertRequiredString(
        this.getStringProperty(source, 'product_slug', 'productSlug'),
        'product_slug'
      ),
      token_prefix: this.assertRequiredString(
        this.getStringProperty(source, 'token_prefix', 'tokenPrefix'),
        'token_prefix'
      ),
      label: this.getNullableStringProperty(source, 'label', 'label'),
      created_by_admin_id: this.getNullableStringProperty(source, 'created_by_admin_id', 'createdByAdminId'),
      expires_at: this.getNullableStringProperty(source, 'expires_at', 'expiresAt'),
      revoked_at: this.getNullableStringProperty(source, 'revoked_at', 'revokedAt'),
      last_used_at: this.getNullableStringProperty(source, 'last_used_at', 'lastUsedAt'),
      created_at: this.assertRequiredString(this.getStringProperty(source, 'created_at', 'createdAt'), 'created_at'),
      updated_at: this.assertRequiredString(this.getStringProperty(source, 'updated_at', 'updatedAt'), 'updated_at'),
    }
  }

  private normalizeListProtectionBuildTokensResponse(
    source: Record<string, unknown>
  ): ListProtectionBuildTokensResponse {
    const tokenSources = this.getArrayProperty(source, 'tokens')
      .filter((tokenSource) => typeof tokenSource === 'object' && tokenSource !== null)
      .map((tokenSource) => this.normalizeProtectionBuildTokenMetadata(tokenSource as Record<string, unknown>))

    return {
      product_id: this.assertRequiredString(this.getStringProperty(source, 'product_id', 'productId'), 'product_id'),
      product_slug: this.assertRequiredString(
        this.getStringProperty(source, 'product_slug', 'productSlug'),
        'product_slug'
      ),
      tokens: tokenSources,
    }
  }

  private normalizeIssueProtectionBuildTokenResponse(
    source: Record<string, unknown>
  ): IssueProtectionBuildTokenResponse {
    const tokenMetadata = this.getRecordProperty(source, 'token_meta', 'tokenMeta')
    if (tokenMetadata === null) {
      throw new ApiException('API response missing required field: token_meta', 'INVALID_RESPONSE')
    }

    return {
      token: this.assertRequiredString(this.getStringProperty(source, 'token', 'token'), 'token'),
      token_meta: this.normalizeProtectionBuildTokenMetadata(tokenMetadata),
    }
  }

  private normalizeRevokeProtectionBuildTokenResponse(
    source: Record<string, unknown>
  ): RevokeProtectionBuildTokenResponse {
    const tokenMetadata = this.getRecordProperty(source, 'token_meta', 'tokenMeta')
    if (tokenMetadata === null) {
      throw new ApiException('API response missing required field: token_meta', 'INVALID_RESPONSE')
    }

    return {
      token_meta: this.normalizeProtectionBuildTokenMetadata(tokenMetadata),
    }
  }

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
