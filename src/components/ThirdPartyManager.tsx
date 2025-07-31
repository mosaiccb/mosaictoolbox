import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit3,
  Trash2,
  Globe,
  TestTube,
  AlertCircle,
  Zap,
} from "lucide-react";
import { backendApi } from "../services/backendApi";
import type { ThirdPartyAPI } from "../types";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddButton = styled.button<{ variant?: "primary" | "secondary" }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;

  ${props => {
    switch (props.variant) {
      case "secondary":
        return `
          background: #10b981;
          color: white;
          &:hover { background: #059669; }
        `;
      default:
        return `
          background: #3b82f6;
          color: white;
          &:hover { background: #2563eb; }
        `;
    }
  }}
`;

const APIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const APICard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CardInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }

  p {
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }

  &.danger:hover {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #dc2626;
  }
`;

const APIDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;

  span:first-child {
    font-weight: 500;
  }
`;

const StatusBadge = styled.span<{ isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) =>
    props.isActive
      ? `
    background: #dcfce7;
    color: #166534;
  `
      : `
    background: #f3f4f6;
    color: #6b7280;
  `}
`;

export const ThirdPartyManager: React.FC = () => {
  const navigate = useNavigate();
  const [apis, setApis] = useState<ThirdPartyAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAPIs();
  }, []);

  const loadAPIs = async () => {
    try {
      setLoading(true);
      
      // For now, skip API loading since listThirdPartyAPIs endpoint returns 404
      // TODO: Implement proper /api/third-party-apis GET endpoint in backend
      console.log('Skipping API list loading - endpoint not fully implemented yet');
      
      // Set empty array for now - user can still create new APIs
      setApis([]);
      
    } catch (err) {
      console.warn('Failed to load APIs (expected - endpoint not implemented):', err);
      setApis([]); // Set empty array instead of showing error
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (id: string) => {
    try {
      const api = apis.find(api => api.id === id);
      if (!api) {
        alert('API not found');
        return;
      }
      const response = await backendApi.testThirdPartyAPIConnection(api);
      if (response.success) {
        alert("API test successful!");
      } else {
        alert(`API test failed: ${response.error}`);
      }
    } catch (err) {
      alert(
        `Test failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API configuration?")) {
      return;
    }

    try {
      await backendApi.deleteThirdPartyAPI(id);
      await loadAPIs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API");
    }
  };

  const getAuthTypeDisplay = (authType: string) => {
    switch (authType) {
      case "none":
        return "No Auth";
      case "apikey":
        return "API Key";
      case "bearer":
        return "Bearer Token";
      case "basic":
        return "Basic Auth";
      case "oauth2":
        return "OAuth 2.0";
      case "custom":
        return "Custom";
      default:
        return authType;
    }
  };

  if (loading) {
    return <Container>Loading third-party APIs...</Container>;
  }

  return (
    <Container>
      <Header>
        <Title>
          <Globe size={32} />
          Third-party APIs
        </Title>
        <HeaderActions>
          <AddButton 
            variant="secondary" 
            onClick={() => navigate("/third-party-apis/par-brink")}
          >
            <Zap size={20} />
            PAR Brink Setup
          </AddButton>
          <AddButton onClick={() => navigate("/third-party-apis/new")}>
            <Plus size={20} />
            Add API
          </AddButton>
        </HeaderActions>
      </Header>

      {error && (
        <div style={{ color: "#dc2626", marginBottom: "1rem" }}>
          <AlertCircle
            size={16}
            style={{ display: "inline", marginRight: "0.5rem" }}
          />
          {error}
        </div>
      )}

      {apis.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            color: "#6b7280",
          }}
        >
          <Globe size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
          <p>No third-party APIs configured yet</p>
        </div>
      ) : (
        <APIGrid>
          {apis.map((api) => (
            <APICard key={api.id}>
              <CardHeader>
                <CardInfo>
                  <h3>{api.name}</h3>
                  <p>{api.category}</p>
                  <StatusBadge isActive={api.isActive}>
                    {api.isActive ? "Active" : "Inactive"}
                  </StatusBadge>
                </CardInfo>
                <CardActions>
                  <ActionButton
                    onClick={() => handleTest(api.id)}
                    title="Test API"
                  >
                    <TestTube size={16} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => navigate(`/third-party-apis/${api.id}/edit`)}
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </ActionButton>
                  <ActionButton
                    className="danger"
                    onClick={() => handleDelete(api.id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </CardActions>
              </CardHeader>

              {api.description && (
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    marginBottom: "1rem",
                  }}
                >
                  {api.description}
                </p>
              )}

              <APIDetails>
                <DetailRow>
                  <span>Base URL:</span>
                  <span>{api.baseUrl}</span>
                </DetailRow>
                <DetailRow>
                  <span>Auth Type:</span>
                  <span>{getAuthTypeDisplay(api.authType)}</span>
                </DetailRow>
                <DetailRow>
                  <span>Endpoints:</span>
                  <span>{api.endpoints.length}</span>
                </DetailRow>
                {api.version && (
                  <DetailRow>
                    <span>Version:</span>
                    <span>{api.version}</span>
                  </DetailRow>
                )}
              </APIDetails>
            </APICard>
          ))}
        </APIGrid>
      )}
    </Container>
  );
};
