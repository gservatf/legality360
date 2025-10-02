import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock Profile type
type Role = 'admin' | 'analista' | 'abogado' | 'cliente' | 'pending';
type Profile = { role: Role };

// Mock components to identify routes
vi.mock('@/components/auth/LoginPage', () => ({
  default: ({ onLogin }: any) => <div>Login Page<button onClick={onLogin}>Login</button></div>,
}));
vi.mock('@/components/auth/PendingAuthorization', () => ({
  default: ({ onLogout }: any) => <div>Pending Authorization<button onClick={onLogout}>Logout</button></div>,
}));
vi.mock('@/components/admin/AdminPanel', () => ({
  default: ({ onLogout }: any) => <div>Admin Panel<button onClick={onLogout}>Logout</button></div>,
}));
vi.mock('@/components/professional/ProfessionalPanel', () => ({
  default: ({ onLogout }: any) => <div>Professional Panel<button onClick={onLogout}>Logout</button></div>,
}));
vi.mock('@/components/client/ClientPanel', () => ({
  default: ({ onLogout }: any) => <div>Client Panel<button onClick={onLogout}>Logout</button></div>,
}));

// Mock authService
const initialize = vi.fn();
const getCurrentUser = vi.fn();
const getCurrentProfile = vi.fn();
const refreshProfile = vi.fn();
const signOut = vi.fn();

vi.mock('@/lib/auth', () => ({
  authService: {
    initialize,
    getCurrentUser,
    getCurrentProfile,
    refreshProfile,
    signOut,
  },
}));

// Helper to setup mocks for each test
function setupAuthMock({
  authenticated,
  role,
}: {
  authenticated: boolean;
  role?: Role;
}) {
  initialize.mockResolvedValue(undefined);
  getCurrentUser.mockReturnValue(authenticated ? { id: 'user' } : null);
  getCurrentProfile.mockReturnValue(authenticated && role ? { role } : null);
  refreshProfile.mockResolvedValue(authenticated && role ? { role } : null);
  signOut.mockResolvedValue(undefined);
}

describe('App integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login if the user is not authenticated', async () => {
    setupAuthMock({ authenticated: false });
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('redirects to /pending if the user profile role is "pending"', async () => {
    setupAuthMock({ authenticated: true, role: 'pending' });
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Pending Authorization')).toBeInTheDocument();
    });
  });

  it('redirects to /admin/dashboard if the role is "admin"', async () => {
    setupAuthMock({ authenticated: true, role: 'admin' });
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });
  });

  it('redirects to /analista/dashboard if the role is "analista"', async () => {
    setupAuthMock({ authenticated: true, role: 'analista' });
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Professional Panel')).toBeInTheDocument();
    });
  });

  it('redirects to /abogado/dashboard if the role is "abogado"', async () => {
    setupAuthMock({ authenticated: true, role: 'abogado' });
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Professional Panel')).toBeInTheDocument();
    });
  });

  it('redirects to /cliente/dashboard if the role is "cliente"', async () => {
    setupAuthMock({ authenticated: true, role: 'cliente' });
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Client Panel')).toBeInTheDocument();
    });
  });
});