import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TenantManager } from './components/TenantManager';
import { ThirdPartyManager } from './components/ThirdPartyManager';
import { ThirdPartyApiForm } from './components/ThirdPartyApiForm';
import { Building, Globe, User, LogOut } from 'lucide-react';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 0.875rem;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Navigation = styled.nav`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
`;

const NavLink = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  background: ${props => props.$active ? '#eff6ff' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$active ? '#eff6ff' : '#f9fafb'};
    color: ${props => props.$active ? '#3b82f6' : '#374151'};
  }
`;

const Main = styled.main`
  min-height: calc(100vh - 200px);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  text-align: center;
`;

interface User {
  name: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('tenants');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is authenticated via Azure AD
      const response = await fetch('/.auth/me');
      
      if (response.ok) {
        const authData = await response.json();
        
        if (authData.length > 0) {
          const userInfo = authData[0];
          setUser({
            name: userInfo.user_claims?.find((c: any) => c.typ === 'name')?.val || 'Unknown User',
            email: userInfo.user_claims?.find((c: any) => c.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress')?.val || ''
          });
        } else {
          // Not authenticated, redirect to login
          window.location.href = '/.auth/login/aad';
          return;
        }
      } else {
        // Not authenticated, redirect to login
        window.location.href = '/.auth/login/aad';
        return;
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Failed to check authentication status');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = '/.auth/logout';
  };

  if (loading) {
    return (
      <AppContainer>
        <LoadingContainer>
          <div>Loading...</div>
        </LoadingContainer>
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <ErrorContainer>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </ErrorContainer>
      </AppContainer>
    );
  }

  if (!user) {
    return (
      <AppContainer>
        <LoadingContainer>
          <div>Redirecting to login...</div>
        </LoadingContainer>
      </AppContainer>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'tenants':
        return <TenantManager />;
      case 'third-party':
        return <ThirdPartyManager />;
      case 'add-api':
        return <ThirdPartyApiForm />;
      default:
        return <TenantManager />;
    }
  };

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <Logo>
            <Building size={32} />
            Mosaic Toolbox
          </Logo>
          <UserInfo>
            <UserDisplay>
              <User size={16} />
              {user.name}
            </UserDisplay>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </LogoutButton>
          </UserInfo>
        </HeaderContent>
      </Header>

      <Navigation>
        <NavContent>
          <NavLink 
            $active={currentPage === 'tenants'} 
            onClick={() => setCurrentPage('tenants')}
          >
            <Building size={18} />
            Tenant Management
          </NavLink>
          <NavLink 
            $active={currentPage === 'third-party'} 
            onClick={() => setCurrentPage('third-party')}
          >
            <Globe size={18} />
            Third Party APIs
          </NavLink>
        </NavContent>
      </Navigation>

      <Main>
        {renderCurrentPage()}
      </Main>
    </AppContainer>
  );
}

export default App;