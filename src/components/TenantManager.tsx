import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Plus,
  Edit3,
  Trash2,
  Building,
  Check,
  X,
  Loader,
  AlertCircle,
  TestTube,
  Power,
} from "lucide-react";
import { backendApi } from "../services/backendApi";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    color: #1f2937;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TenantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TenantCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid #e5e7eb;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const TenantHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const TenantInfo = styled.div`
  h3 {
    margin: 0 0 0.5rem 0;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const TenantActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }

  &.danger:hover {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #dc2626;
  }

  &.success:hover {
    background: #f0fff4;
    border-color: #86efac;
    color: #059669;
  }

  &.warning:hover {
    background: #fffbeb;
    border-color: #fcd34d;
    color: #d97706;
  }
`;

const TenantDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    label {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 500;
    }

    span {
      color: #1f2937;
      font-family: "Consolas", monospace;
      font-size: 0.875rem;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  min-width: 500px;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    color: #1f2937;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatusBadge = styled.span<{ $isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;

  ${(props) =>
    props.$isActive
      ? `
    background-color: #dcfce7;
    color: #16a34a;
  `
      : `
    background-color: #fee2e2;
    color: #dc2626;
  `}
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
    color: #374151;
  }

  input {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &.primary {
    background: #3b82f6;
    color: white;

    &:hover {
      background: #2563eb;
    }
  }

  &.secondary {
    background: #f9fafb;
    color: #374151;
    border: 1px solid #d1d5db;

    &:hover {
      background: #f3f4f6;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SuccessMessage = styled.div`
  background: #f0fff4;
  color: #059669;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

interface TenantFormData {
  tenantId: string;
  tenantName: string;
  companyId: string;
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

interface TenantInfo {
  id: string;
  tenantName: string;
  companyId: string;
  baseUrl: string;
  clientId: string;
  description?: string;
  isActive: boolean;
  hasClientSecret: boolean;
  createdDate: string;
  modifiedDate?: string;
  tokenEndpoint?: string;
  apiVersion?: string;
  scope?: string;
}

// Local storage key for tenant names
const TENANT_NAMES_KEY = "tenant-names";

// Helper functions for local storage
const getTenantNames = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(TENANT_NAMES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveTenantName = (tenantId: string, tenantName: string) => {
  try {
    const tenantNames = getTenantNames();
    tenantNames[tenantId] = tenantName;
    localStorage.setItem(TENANT_NAMES_KEY, JSON.stringify(tenantNames));
  } catch (err) {
    console.error("Failed to save tenant name:", err);
  }
};

const removeTenantName = (tenantId: string) => {
  try {
    const tenantNames = getTenantNames();
    delete tenantNames[tenantId];
    localStorage.setItem(TENANT_NAMES_KEY, JSON.stringify(tenantNames));
  } catch (err) {
    console.error("Failed to remove tenant name:", err);
  }
};

export const TenantManager: React.FC = () => {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<string | null>(null);
  const [formData, setFormData] = useState<TenantFormData>({
    tenantId: "",
    tenantName: "",
    companyId: "33631552",
    clientId: "",
    clientSecret: "",
    baseUrl: "https://secure2.saashr.com",
  });
  const [testingToken, setTestingToken] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  // Debug function to manually set tenant names (temporary)
  const setTenantNameManually = (tenantId: string, name: string) => {
    saveTenantName(tenantId, name);
    loadTenants();
  };

  // Make debug function available in browser console
  React.useEffect(() => {
    (window as any).setTenantName = setTenantNameManually;
    (window as any).getTenantNames = getTenantNames;
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await backendApi.listTenants();

      // Check if response is successful
      if (!response.success) {
        throw new Error(response.error || "Failed to load tenants");
      } // The data should already be the array of tenants from makeRequest
      const tenantData = response.data || [];
      console.log("Tenant data:", tenantData);

      // Ensure data is an array
      if (!Array.isArray(tenantData)) {
        console.error("Expected array but got:", typeof tenantData, tenantData);
        throw new Error("Invalid data format: expected array of tenants");
      }

      // Transform backend response to match our TenantInfo interface
      const tenantDetails: TenantInfo[] = tenantData.map((tenant: any) => ({
        id: tenant.id || "",
        tenantName: tenant.tenantName || "",
        companyId: tenant.companyId || "",
        baseUrl: tenant.baseUrl || "",
        clientId: tenant.clientId || "",
        description: tenant.description,
        isActive: tenant.isActive,
        hasClientSecret: !!tenant.clientId, // Assume if we have clientId, we have secret
        createdDate: tenant.createdDate || "",
        modifiedDate: tenant.modifiedDate,
        tokenEndpoint: tenant.tokenEndpoint,
        apiVersion: tenant.apiVersion,
        scope: tenant.scope,
      }));

      setTenants(tenantDetails);
      console.log("Loaded tenants:", tenantDetails);
    } catch (err) {
      console.error("Failed to load tenants:", err);
      console.error("Error name:", (err as any)?.constructor?.name);
      console.error("Error message:", (err as any)?.message);
      console.error("Full error object:", err);
      console.error("Stack trace:", (err as any)?.stack);
      setError(err instanceof Error ? err.message : "Failed to load tenants");
      // Set empty array as fallback to prevent map errors
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = () => {
    setEditingTenant(null);
    setFormData({
      tenantId: backendApi.generateTenantId(),
      tenantName: "",
      companyId: "33631552",
      clientId: "",
      clientSecret: "",
      baseUrl: "https://secure2.saashr.com",
    });
    setShowModal(true);
  };

  const handleEditTenant = async (tenantId: string) => {
    try {
      setError(null);
      // Find the tenant info to get the name
      const tenant = tenants.find((t) => t.id === tenantId);

      setEditingTenant(tenantId);
      setFormData({
        tenantId,
        tenantName: tenant?.tenantName || "",
        companyId: "33631552",
        clientId: "",
        clientSecret: "",
        baseUrl: "https://secure2.saashr.com",
      });
      setShowModal(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load tenant details"
      );
    }
  };

  const handleToggleTenantStatus = async (
    tenantId: string,
    currentStatus: boolean
  ) => {
    try {
      setError(null);
      const newStatus = !currentStatus;
      const tenant = tenants.find((t) => t.id === tenantId);

      if (!tenant) {
        throw new Error("Tenant not found");
      }

      await backendApi.updateTenant(tenantId, {
        id: tenantId,
        tenantName: tenant.tenantName,
        companyId: tenant.companyId,
        baseUrl: tenant.baseUrl,
        clientId: tenant.clientId,
        isActive: newStatus,
      });

      setSuccess(
        `Tenant ${newStatus ? "activated" : "deactivated"} successfully`
      );
      await loadTenants();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update tenant status"
      );
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this tenant? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setError(null);
      await backendApi.deleteTenant(tenantId);

      // Remove tenant name from localStorage
      removeTenantName(tenantId);

      setSuccess("Tenant deleted successfully");
      await loadTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tenant");
    }
  };

  const handleTestToken = async (tenantId: string) => {
    try {
      setTestingToken(tenantId);
      setError(null);

      console.log("Testing OAuth for tenant:", tenantId);
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }
      
      const response = await backendApi.getOAuthToken({
        baseUrl: tenant.baseUrl,
        clientId: tenant.clientId,
        clientSecret: '', // Would need to get from backend
        companyId: tenant.companyId
      });

      console.log("OAuth response:", response);
      if (response.success && response.data) {
        setSuccess(
          `Token test successful! ${response.data.expires_in ? `Token expires in ${response.data.expires_in} seconds` : 'Token obtained successfully'}`
        );
      } else {
        throw new Error(response.error || 'Token test failed');
      }
    } catch (err) {
      console.error("OAuth test error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to test token";
      setError(`OAuth test failed: ${errorMessage}`);
    } finally {
      setTestingToken(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);

      const tenantRequest = {
        tenantName: formData.tenantName,
        companyId: formData.companyId,
        baseUrl: formData.baseUrl,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        description: `Tenant configuration for ${formData.tenantName}`,
        isActive: true,
      };

      console.log("Submitting tenant data:", tenantRequest);

      if (editingTenant) {
        // Update existing tenant
        const updateRequest = { id: editingTenant, ...tenantRequest };
        await backendApi.updateTenant(editingTenant, updateRequest);
      } else {
        // Create new tenant
        await backendApi.createTenant(tenantRequest);
      }

      // Save tenant name to localStorage
      if (formData.tenantName.trim()) {
        saveTenantName(formData.tenantId, formData.tenantName);
        console.log(
          "Saved tenant name:",
          formData.tenantName,
          "for tenant:",
          formData.tenantId
        );
      }

      setSuccess(
        editingTenant
          ? "Tenant updated successfully"
          : "Tenant created successfully"
      );
      setShowModal(false);
      await loadTenants();
    } catch (err) {
      console.error("Failed to save tenant:", err);
      setError(err instanceof Error ? err.message : "Failed to save tenant");
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <Loader className="spinner" size={24} />
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>
          <Building size={24} />
          Tenant Management
        </h1>
        <AddButton onClick={handleAddTenant}>
          <Plus size={18} />
          Add Tenant
        </AddButton>
      </Header>

      {error && (
        <ErrorMessage>
          <AlertCircle size={18} />
          {error}
          <button
            onClick={clearMessages}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "inherit",
            }}
          >
            <X size={16} />
          </button>
        </ErrorMessage>
      )}

      {success && (
        <SuccessMessage>
          <Check size={18} />
          {success}
          <button
            onClick={clearMessages}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "inherit",
            }}
          >
            <X size={16} />
          </button>
        </SuccessMessage>
      )}

      <TenantGrid>
        {tenants && tenants.length > 0 ? (
          tenants.map((tenant) => (
            <TenantCard key={tenant.id}>
              <TenantHeader>
                <TenantInfo>
                  <h3>
                    <Building size={18} />
                    {tenant.tenantName}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <StatusBadge $isActive={tenant.isActive}>
                      {tenant.isActive ? "● Active" : "● Inactive"}
                    </StatusBadge>
                  </div>
                  <p>{tenant.id}</p>
                  <small
                    style={{
                      color: "#6b7280",
                      fontSize: "0.75rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    {tenant.hasClientSecret
                      ? "✓ Configured"
                      : "⚠ Not configured"}
                  </small>
                </TenantInfo>
                <TenantActions>
                  <ActionButton
                    className="success"
                    onClick={() => handleTestToken(tenant.id)}
                    disabled={testingToken === tenant.id}
                    title="Test OAuth Token"
                  >
                    {testingToken === tenant.id ? (
                      <Loader size={16} className="spinner" />
                    ) : (
                      <TestTube size={16} />
                    )}
                  </ActionButton>
                  <ActionButton
                    className={tenant.isActive ? "warning" : "success"}
                    onClick={() =>
                      handleToggleTenantStatus(tenant.id, tenant.isActive)
                    }
                    title={
                      tenant.isActive ? "Deactivate Tenant" : "Activate Tenant"
                    }
                  >
                    <Power size={16} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleEditTenant(tenant.id)}
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </ActionButton>
                  <ActionButton
                    className="danger"
                    onClick={() => handleDeleteTenant(tenant.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </TenantActions>
              </TenantHeader>

              <TenantDetails>
                <div className="detail-item">
                  <label>Base URL</label>
                  <span>{tenant.baseUrl}</span>
                </div>
                <div className="detail-item">
                  <label>Client ID</label>
                  <span>{tenant.clientId}</span>
                </div>
              </TenantDetails>
            </TenantCard>
          ))
        ) : (
          <div
            style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}
          >
            <Building
              size={48}
              style={{ marginBottom: "1rem", opacity: 0.5 }}
            />
            <p>
              {loading
                ? "Loading tenants..."
                : 'No tenants configured yet. Click "Add Tenant" to get started.'}
            </p>
          </div>
        )}
      </TenantGrid>

      {/* Remove duplicate empty state since it's now handled in the ternary above */}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>{editingTenant ? "Edit Tenant" : "Add New Tenant"}</h2>
              <ActionButton onClick={() => setShowModal(false)}>
                <X size={16} />
              </ActionButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormField>
                <label>Tenant ID {!editingTenant && "(Auto-generated)"}</label>
                <input
                  type="text"
                  value={formData.tenantId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tenantId: e.target.value,
                    }))
                  }
                  placeholder="e.g., 11111111-2222-3333-4444-555555555555"
                  required
                  disabled={!!editingTenant}
                  readOnly={!editingTenant}
                  style={
                    !editingTenant
                      ? { backgroundColor: "#f9fafb", color: "#6b7280" }
                      : {}
                  }
                />
              </FormField>

              <FormField>
                <label>Tenant Name</label>
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tenantName: e.target.value,
                    }))
                  }
                  placeholder="e.g., Mosaic Employer Solutions"
                  required
                />
              </FormField>

              <FormField>
                <label>Company ID</label>
                <input
                  type="text"
                  value={formData.companyId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyId: e.target.value,
                    }))
                  }
                  placeholder="e.g., 33631552"
                  required
                />
              </FormField>

              <FormField>
                <label>Client ID</label>
                <input
                  type="text"
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientId: e.target.value,
                    }))
                  }
                  placeholder="e.g., eda29552-f310-4377-88be-e54a71e2e5aa"
                  required
                />
              </FormField>

              <FormField>
                <label>Client Secret</label>
                <input
                  type="password"
                  value={formData.clientSecret}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clientSecret: e.target.value,
                    }))
                  }
                  placeholder="e.g., X41MLdHC.18tglVeX8iF.dN5t"
                  required
                />
              </FormField>

              <FormField>
                <label>Base URL</label>
                <input
                  type="url"
                  value={formData.baseUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      baseUrl: e.target.value,
                    }))
                  }
                  placeholder="https://secure2.saashr.com"
                  required
                />
              </FormField>

              <FormActions>
                <Button
                  type="button"
                  className="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="primary">
                  {editingTenant ? "Update" : "Create"} Tenant
                </Button>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};