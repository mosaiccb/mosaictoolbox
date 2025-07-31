import type { ThirdPartyAPI, ApiResponse, TenantConfig, CreateTenantRequest, UpdateTenantRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7074';

class BackendApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Avoid CORS preflight for GET requests by not setting unnecessary headers
      const defaultHeaders: Record<string, string> = {};
      
      // Only set Content-Type for requests that have a body
      if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
        defaultHeaders['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        ...options,
      });

      // Check if response has content before trying to parse JSON
      const responseText = await response.text();
      let data;
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', responseText);
        return {
          success: false,
          error: 'Invalid JSON response from server',
          details: [responseText],
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          details: data.details,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Third-party API Management
  async getThirdPartyAPIs(): Promise<ApiResponse<ThirdPartyAPI[]>> {
    return this.makeRequest<ThirdPartyAPI[]>('/api/thirdpartyapis');
  }

  // Alias for compatibility with ETL page
  async listThirdPartyAPIs(): Promise<ApiResponse<ThirdPartyAPI[]>> {
    return this.getThirdPartyAPIs();
  }

  async getThirdPartyAPI(id: string): Promise<ApiResponse<ThirdPartyAPI>> {
    return this.makeRequest<ThirdPartyAPI>(`/api/thirdpartyapis/${id}`);
  }

  async createThirdPartyAPI(apiData: Omit<ThirdPartyAPI, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ThirdPartyAPI>> {
    console.log('Creating third-party API with data:', apiData);
    
    return this.makeRequest<ThirdPartyAPI>('/api/thirdpartyapis', {
      method: 'POST',
      body: JSON.stringify({
        ...apiData,
        tenantId: 'default-tenant', // Add default tenant ID
        isActive: apiData.isActive ?? true,
      }),
    });
  }

  async createThirdPartyAPIEnhanced(apiData: Omit<ThirdPartyAPI, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ThirdPartyAPI>> {
    console.log('Creating enhanced third-party API with data:', apiData);
    
    return this.makeRequest<ThirdPartyAPI>('/api/configurations/enhanced', {
      method: 'POST',
      body: JSON.stringify({
        ...apiData,
        tenantId: 'default-tenant', // Add default tenant ID
        isActive: apiData.isActive ?? true,
      }),
    });
  }

  async updateThirdPartyAPI(id: string, apiData: Partial<ThirdPartyAPI>): Promise<ApiResponse<ThirdPartyAPI>> {
    return this.makeRequest<ThirdPartyAPI>(`/api/thirdpartyapis/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...apiData,
        updatedAt: new Date().toISOString(),
      }),
    });
  }

  async deleteThirdPartyAPI(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/api/thirdpartyapis/${id}`, {
      method: 'DELETE',
    });
  }

  async testThirdPartyAPIConnection(apiData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/testParBrinkConnection/enhanced', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  // PAR Brink specific methods
  async getParBrinkEmployees(locationData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/par-brink/employees', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async getParBrinkLaborShifts(accessToken: string, locationToken: string, businessDate: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/par-brink/clocked-in', {
      method: 'POST',
      body: JSON.stringify({
        accessToken,
        locationToken,
        businessDate
      }),
    });
  }

  async getParBrinkSales(locationData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/par-brink/sales', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async getParBrinkConfigurations(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/api/par-brink/configurations');
  }

  async getParBrinkDashboardData(locationToken: string, accessToken: string, businessDate?: string, timezone?: string): Promise<ApiResponse<any>> {
    // Calculate proper business date if not provided
    let finalBusinessDate = businessDate;
    let finalTimezone = timezone || "America/Denver"; // Default to Mountain Time for existing locations
    
    if (!finalBusinessDate) {
      const now = new Date();
      const localTime = new Date(now.toLocaleString("en-US", { timeZone: finalTimezone }));
      
      // If it's before 3 AM in local timezone, use yesterday's date as business date
      if (localTime.getHours() < 3) {
        const yesterday = new Date(localTime);
        yesterday.setDate(yesterday.getDate() - 1);
        finalBusinessDate = yesterday.toISOString().split("T")[0];
      } else {
        finalBusinessDate = localTime.toISOString().split("T")[0];
      }
    }
    
    return this.makeRequest<any>('/api/par-brink/dashboard', {
      method: 'POST',
      body: JSON.stringify({
        locationToken,
        accessToken,
        businessDate: finalBusinessDate,
        timezone: finalTimezone
      }),
    });
  }

  async getParBrinkClockedIn(locationToken: string, accessToken: string, businessDate?: string): Promise<ApiResponse<any>> {
    // Calculate proper business date if not provided
    let finalBusinessDate = businessDate;
    
    if (!finalBusinessDate) {
      const now = new Date();
      const mountainTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Denver" }));
      
      // If it's before 3 AM in Mountain time, use yesterday's date as business date
      if (mountainTime.getHours() < 3) {
        const yesterday = new Date(mountainTime);
        yesterday.setDate(yesterday.getDate() - 1);
        finalBusinessDate = yesterday.toISOString().split("T")[0];
      } else {
        finalBusinessDate = mountainTime.toISOString().split("T")[0];
      }
    }
    
    return this.makeRequest<any>('/api/par-brink/clocked-in', {
      method: 'POST',
      body: JSON.stringify({
        locationToken,
        accessToken,
        businessDate: finalBusinessDate
      }),
    });
  }

  async getParBrinkTips(locationToken: string, accessToken: string, startDate?: string): Promise<ApiResponse<any>> {
    // Calculate proper business date if not provided
    let finalStartDate = startDate;
    
    if (!finalStartDate) {
      const now = new Date();
      const mountainTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Denver" }));
      
      // If it's before 3 AM in Mountain time, use yesterday's date as business date
      if (mountainTime.getHours() < 3) {
        const yesterday = new Date(mountainTime);
        yesterday.setDate(yesterday.getDate() - 1);
        finalStartDate = yesterday.toISOString().split("T")[0];
      } else {
        finalStartDate = mountainTime.toISOString().split("T")[0];
      }
    }
    
    return this.makeRequest<any>('/api/par-brink/tips', {
      method: 'POST',
      body: JSON.stringify({
        locationToken,
        accessToken,
        startDate: finalStartDate
      }),
    });
  }

  async getParBrinkTills(locationToken: string, accessToken: string, businessDate?: string): Promise<ApiResponse<any>> {
    // Calculate proper business date if not provided
    let finalBusinessDate = businessDate;
    
    if (!finalBusinessDate) {
      const now = new Date();
      const mountainTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Denver" }));
      
      // If it's before 3 AM in Mountain time, use yesterday's date as business date
      if (mountainTime.getHours() < 3) {
        const yesterday = new Date(mountainTime);
        yesterday.setDate(yesterday.getDate() - 1);
        finalBusinessDate = yesterday.toISOString().split("T")[0];
      } else {
        finalBusinessDate = mountainTime.toISOString().split("T")[0];
      }
    }
    
    return this.makeRequest<any>('/api/par-brink/tills', {
      method: 'POST',
      body: JSON.stringify({
        locationToken,
        accessToken,
        businessDate: finalBusinessDate
      }),
    });
  }

  // Tenant Management methods (V2 endpoints)
  async listTenants(): Promise<ApiResponse<TenantConfig[]>> {
    return this.makeRequest<TenantConfig[]>('/api/v2/tenants');
  }

  async getTenant(id: string): Promise<ApiResponse<TenantConfig>> {
    return this.makeRequest<TenantConfig>(`/api/v2/tenants?id=${encodeURIComponent(id)}`);
  }

  async createTenant(tenantData: CreateTenantRequest): Promise<ApiResponse<{ id: string }>> {
    return this.makeRequest<{ id: string }>('/api/v2/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(id: string, tenantData: UpdateTenantRequest): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/v2/tenants?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData),
    });
  }

  async deleteTenant(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/api/v2/tenants?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // Tenant credentials method (V2 endpoint)
  async getTenantCredentials(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/v2/tenants/credentials?id=${encodeURIComponent(id)}`);
  }

  // Utility methods for tenant management
  generateTenantId(): string {
    return crypto.randomUUID();
  }

  async getOAuthToken(config: { baseUrl: string; clientId: string; clientSecret: string; companyId: string }): Promise<ApiResponse<any>> {
    // This could be implemented as a test endpoint in the backend
    return this.makeRequest<any>('/api/oauth/test', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // UKG Ready API methods
  async callUKGReadyAPI(tenantId: string, module: 'timeentries' | 'employees', action: string, data?: any): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      tenant: tenantId,
      module,
      action
    });

    return this.makeRequest<any>(`/api/ukg-ready?${params.toString()}`, {
      method: data ? 'POST' : 'GET',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Time Entries API methods
  async getTimeEntries(tenantId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'timeentries', 'list');
  }

  async getTimeEntry(tenantId: string, timeEntryId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'timeentries', 'get', { timeEntryId });
  }

  async createTimeEntry(tenantId: string, timeEntryData: any): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'timeentries', 'create', timeEntryData);
  }

  async updateTimeEntry(tenantId: string, timeEntryId: string, timeEntryData: any): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'timeentries', 'update', { timeEntryId, ...timeEntryData });
  }

  async deleteTimeEntry(tenantId: string, timeEntryId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'timeentries', 'delete', { timeEntryId });
  }

  async approveTimeEntry(tenantId: string, timeEntryId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'timeentries', 'approve', { timeEntryId });
  }

  async rejectTimeEntry(tenantId: string, timeEntryId: string, reason?: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'timeentries', 'reject', { timeEntryId, reason });
  }

  async getPayPeriodTimeEntries(tenantId: string, payPeriodId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'timeentries', 'payperiod', { payPeriodId });
  }

  // Employee API methods
  async getUKGEmployees(tenantId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'list');
  }

  async getUKGEmployee(tenantId: string, employeeId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'get', { employeeId });
  }

  async createUKGEmployee(tenantId: string, employeeData: any): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'create', employeeData);
  }

  async updateUKGEmployee(tenantId: string, employeeId: string, employeeData: any): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'update', { employeeId, ...employeeData });
  }

  async deactivateUKGEmployee(tenantId: string, employeeId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'deactivate', { employeeId });
  }

  async terminateUKGEmployee(tenantId: string, employeeId: string, terminationData?: any): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'terminate', { employeeId, ...terminationData });
  }

  async getUKGDepartments(tenantId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'departments');
  }

  async getUKGPositions(tenantId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'positions');
  }

  async getUKGManagers(tenantId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'managers');
  }

  async getUKGEmployeeSchedule(tenantId: string, employeeId: string): Promise<ApiResponse<any>> {
    return this.callUKGReadyAPI(tenantId, 'employees', 'schedule', { employeeId });
  }
}

export const backendApi = new BackendApiService();
