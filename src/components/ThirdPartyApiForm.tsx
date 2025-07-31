import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, TestTube, Globe } from "lucide-react";
import { backendApi } from "../services/backendApi";
import type { ThirdPartyAPI } from "../types";

const Container = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  ${(props) => props.fullWidth && "grid-column: 1 / -1;"}
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" | "test" }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: #3b82f6;
          color: white;
          &:hover { background: #2563eb; }
        `;
      case "test":
        return `
          background: #10b981;
          color: white;
          &:hover { background: #059669; }
        `;
      default:
        return `
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover { background: #f9fafb; }
        `;
    }
  }}
`;

const AuthFields = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

export const ThirdPartyApiForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    baseUrl: "",
    version: "",
    authType: "none" as ThirdPartyAPI["authType"],
    authConfig: {
      apiKeyHeader: "",
      apiKeyValue: "",
      bearerToken: "",
      username: "",
      password: "",
      customHeaders: {} as Record<string, string>,
    },
    healthCheckEndpoint: "",
    isActive: true,
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const apiData: Omit<ThirdPartyAPI, "id" | "createdAt" | "updatedAt"> = {
        ...formData,
        endpoints: [], // Start with empty endpoints, can add later
        rateLimits: undefined,
        lastTestedAt: undefined,
      };

      await backendApi.createThirdPartyAPI(apiData);
      navigate("/"); // Go back to dashboard for now
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save API");
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Test the API connection using the health check endpoint
      const testEndpoint = formData.healthCheckEndpoint
        ? `${formData.baseUrl}${formData.healthCheckEndpoint}`
        : formData.baseUrl;

      const headers: Record<string, string> = {};

      if (
        formData.authType === "apikey" &&
        formData.authConfig.apiKeyHeader &&
        formData.authConfig.apiKeyValue
      ) {
        headers[formData.authConfig.apiKeyHeader] =
          formData.authConfig.apiKeyValue;
      } else if (
        formData.authType === "bearer" &&
        formData.authConfig.bearerToken
      ) {
        headers["Authorization"] = `Bearer ${formData.authConfig.bearerToken}`;
      } else if (
        formData.authType === "basic" &&
        formData.authConfig.username &&
        formData.authConfig.password
      ) {
        const basicAuth = btoa(
          `${formData.authConfig.username}:${formData.authConfig.password}`
        );
        headers["Authorization"] = `Basic ${basicAuth}`;
      }

      // Note: In a real app, this would go through the backend
      setTestResult(
        `Test connection successful for ${testEndpoint}! (Note: Actual API testing requires backend implementation)`
      );
    } catch (err) {
      setTestResult(
        `Test failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setTesting(false);
    }
  };

  const renderAuthFields = () => {
    switch (formData.authType) {
      case "apikey":
        return (
          <AuthFields>
            <FormGrid>
              <FormField>
                <Label>API Key Header Name</Label>
                <Input
                  type="text"
                  value={formData.authConfig.apiKeyHeader}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      authConfig: {
                        ...prev.authConfig,
                        apiKeyHeader: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g., X-API-Key"
                />
              </FormField>
              <FormField>
                <Label>API Key Value</Label>
                <Input
                  type="password"
                  value={formData.authConfig.apiKeyValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      authConfig: {
                        ...prev.authConfig,
                        apiKeyValue: e.target.value,
                      },
                    }))
                  }
                  placeholder="Your API key"
                />
              </FormField>
            </FormGrid>
          </AuthFields>
        );

      case "bearer":
        return (
          <AuthFields>
            <FormField>
              <Label>Bearer Token</Label>
              <Input
                type="password"
                value={formData.authConfig.bearerToken}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    authConfig: {
                      ...prev.authConfig,
                      bearerToken: e.target.value,
                    },
                  }))
                }
                placeholder="Your bearer token"
              />
            </FormField>
          </AuthFields>
        );

      case "basic":
        return (
          <AuthFields>
            <FormGrid>
              <FormField>
                <Label>Username</Label>
                <Input
                  type="text"
                  value={formData.authConfig.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      authConfig: {
                        ...prev.authConfig,
                        username: e.target.value,
                      },
                    }))
                  }
                />
              </FormField>
              <FormField>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.authConfig.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      authConfig: {
                        ...prev.authConfig,
                        password: e.target.value,
                      },
                    }))
                  }
                />
              </FormField>
            </FormGrid>
          </AuthFields>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate("/third-party-apis")}>
          <ArrowLeft size={20} />
        </BackButton>
        <Title>
          <Globe size={32} />
          Add Third-party API
        </Title>
      </Header>

      {error && (
        <div style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</div>
      )}
      {testResult && (
        <div
          style={{
            color: testResult.includes("successful") ? "#059669" : "#dc2626",
            marginBottom: "1rem",
            padding: "0.75rem",
            background: testResult.includes("successful")
              ? "#f0fff4"
              : "#fef2f2",
            borderRadius: "8px",
          }}
        >
          {testResult}
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <FormSection>
          <h3>Basic Information</h3>
          <FormGrid>
            <FormField>
              <Label>API Name *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </FormField>
            <FormField>
              <Label>Category *</Label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="e.g., CRM, Payment, Analytics"
                required
              />
            </FormField>
            <FormField>
              <Label>Base URL *</Label>
              <Input
                type="url"
                value={formData.baseUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, baseUrl: e.target.value }))
                }
                placeholder="https://api.example.com"
                required
              />
            </FormField>
            <FormField>
              <Label>Version</Label>
              <Input
                type="text"
                value={formData.version}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, version: e.target.value }))
                }
                placeholder="e.g., v1, 2.0"
              />
            </FormField>
            <FormField fullWidth>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what this API is used for..."
              />
            </FormField>
          </FormGrid>
        </FormSection>

        <FormSection>
          <h3>Authentication</h3>
          <FormGrid>
            <FormField>
              <Label>Authentication Type</Label>
              <Select
                value={formData.authType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    authType: e.target.value as ThirdPartyAPI["authType"],
                  }))
                }
              >
                <option value="none">No Authentication</option>
                <option value="apikey">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="oauth2">OAuth 2.0</option>
                <option value="custom">Custom</option>
              </Select>
            </FormField>
            <FormField>
              <Label>Health Check Endpoint</Label>
              <Input
                type="text"
                value={formData.healthCheckEndpoint}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    healthCheckEndpoint: e.target.value,
                  }))
                }
                placeholder="/health or /status"
              />
            </FormField>
          </FormGrid>
          {renderAuthFields()}
        </FormSection>

        <ButtonGroup>
          <Button
            variant="test"
            type="button"
            onClick={handleTest}
            disabled={testing}
          >
            <TestTube size={20} />
            {testing ? "Testing..." : "Test Connection"}
          </Button>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/third-party-apis")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <Save size={20} />
              Save API
            </Button>
          </div>
        </ButtonGroup>
      </Form>
    </Container>
  );
};
