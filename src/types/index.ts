// TypeScript interfaces that match the Azure Functions backend

export interface ApiEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'bearer' | 'apikey' | 'oauth2' | 'basic' | 'none';
  authConfig: Record<string, any>;
  headers?: Record<string, string>;
  rateLimitConfig?: {
    requestsPerSecond: number;
    burstLimit?: number;
    retryAfterHeader?: string;
  };
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  destinationField: string;
  transformFunction?: string;
  isRequired: boolean;
  defaultValue?: any;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'regex' | 'length' | 'range' | 'custom';
  value: any;
  errorMessage?: string;
}

export interface SyncConfiguration {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sourceApi: ApiEndpoint;
  destinationApi: ApiEndpoint;
  mappingRules: FieldMapping[];
  schedule?: string;
  lastSyncTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncJob {
  id: string;
  configurationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errorDetails?: string;
  metrics?: {
    totalDuration: number;
    apiCallsSource: number;
    apiCallsDestination: number;
    dataTransferredBytes: number;
    averageRecordProcessingTime: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
}

// Form data types for creating/editing configurations
export interface ConfigurationFormData {
  name: string;
  description?: string;
  isActive: boolean;
  sourceApi: Omit<ApiEndpoint, 'id'>;
  destinationApi: Omit<ApiEndpoint, 'id'>;
  mappingRules: Omit<FieldMapping, 'id'>[];
  schedule?: string;
}

// Third-party API types
export interface ThirdPartyAPI {
  id: string;
  name: string;
  description?: string;
  category: string;
  baseUrl: string;
  version?: string;
  authType: 'none' | 'apikey' | 'bearer' | 'basic' | 'oauth2' | 'custom';
  authConfig: {
    apiKeyHeader?: string;
    apiKeyValue?: string;
    bearerToken?: string;
    username?: string;
    password?: string;
    oauth2Config?: {
      clientId: string;
      clientSecret: string;
      tokenUrl: string;
      scope?: string;
      grantType: 'client_credentials' | 'authorization_code' | 'password';
    };
    customHeaders?: Record<string, string>;
    // PAR Brink specific fields
    accessToken?: string;
    locations?: Array<{
      id: string;
      name: string;
      locationId: string;
      token: string;
      isActive: boolean;
    }>;
    // Additional custom fields for other APIs
    [key: string]: any;
  };
  endpoints: APIEndpointDefinition[];
  rateLimits?: {
    requestsPerSecond?: number;
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  healthCheckEndpoint?: string;
  isActive: boolean;
  lastTestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIEndpointDefinition {
  id: string;
  name: string;
  description?: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestBody?: {
    contentType: string;
    schema: {
      type: string;
      properties?: Record<string, any>;
      required?: string[];
      format?: string;
      template?: string;
    };
  };
  responseBody?: {
    contentType: string;
    schema: Record<string, any>;
  };
  headers?: Record<string, string>;
  parameters?: Array<{
    name: string;
    in: 'query' | 'path' | 'header' | 'body';
    required: boolean;
    type: string;
    description?: string;
  }>;
}

// API client response types
export type ConfigurationsResponse = ApiResponse<SyncConfiguration[]>;
export type ConfigurationResponse = ApiResponse<SyncConfiguration>;
export type JobsResponse = ApiResponse<SyncJob[]>;
export type TriggerResponse = ApiResponse<{ jobId: string }>;

// ETL Configuration types
export interface ETLConfiguration {
  id: string;
  name: string;
  description?: string;
  sourceTenantId: string;
  destinationTenantId?: string;
  destinationApiId?: string;
  mappingType: 'tenant-to-tenant' | 'tenant-to-thirdparty' | 'thirdparty-to-tenant' | 'thirdparty-to-thirdparty';
  transformations: ETLTransformation[];
  schedule?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tenant Configuration types (matching backend)
export interface TenantConfig {
  id: string;
  tenantName: string;
  companyId: string;
  baseUrl: string;
  clientId: string;
  description?: string;
  isActive: boolean;
  createdDate: Date;
  modifiedDate?: Date;
  tokenEndpoint?: string;
  apiVersion?: string;
  scope?: string;
}

export interface CreateTenantRequest {
  tenantName: string;
  companyId: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  description?: string;
}

export interface UpdateTenantRequest {
  id: string;
  tenantName: string;
  companyId: string;
  baseUrl: string;
  clientId: string;
  clientSecret?: string;
  description?: string;
  isActive?: boolean;
}

export interface ETLTransformation {
  id: string;
  sourceField: string;
  destinationField: string;
  transformationType: 'direct' | 'function' | 'lookup' | 'aggregate';
  transformationConfig?: {
    function?: string;
    lookupTable?: string;
    aggregateFunction?: 'sum' | 'avg' | 'min' | 'max' | 'count';
    groupBy?: string[];
  };
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  isRequired: boolean;
  defaultValue?: any;
}

// ETL API response types
export type ETLConfigurationsResponse = ApiResponse<ETLConfiguration[]>;
export type ETLConfigurationResponse = ApiResponse<ETLConfiguration>;

// UKG Ready API types
export interface UKGTimeEntry {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  payCode?: string;
  department?: string;
  costCenter?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdDate: string;
  modifiedDate?: string;
}

export interface UKGEmployee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  status: 'active' | 'inactive' | 'terminated';
  hireDate: string;
  terminationDate?: string;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionTitle?: string;
  managerId?: string;
  managerName?: string;
  payGroup?: string;
  payRate?: number;
  createdDate: string;
  modifiedDate?: string;
}

export interface UKGDepartment {
  id: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string;
}

export interface UKGPosition {
  id: string;
  name: string;
  description?: string;
  departmentId?: string;
  departmentName?: string;
  isActive: boolean;
  payGrade?: string;
  createdDate: string;
  modifiedDate?: string;
}

export interface UKGSchedule {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  totalHours: number;
  departmentId?: string;
  positionId?: string;
  status: 'scheduled' | 'confirmed' | 'cancelled';
}

export interface UKGApiResponse<T> {
  data: T;
  totalRecords?: number;
  page?: number;
  pageSize?: number;
  hasMorePages?: boolean;
}

// UKG Ready API request types
export interface CreateTimeEntryRequest {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  payCode?: string;
  department?: string;
  costCenter?: string;
}

export interface UpdateTimeEntryRequest {
  startTime?: string;
  endTime?: string;
  payCode?: string;
  department?: string;
  costCenter?: string;
}

export interface CreateEmployeeRequest {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  hireDate: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  payGroup?: string;
  payRate?: number;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  payGroup?: string;
  payRate?: number;
}

export interface TerminateEmployeeRequest {
  terminationDate: string;
  terminationReason?: string;
  finalPayDate?: string;
}
