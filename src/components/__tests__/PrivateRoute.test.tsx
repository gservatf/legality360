import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { PrivateRoute } from '../PrivateRoute';

// Mock Profile type
type Profile = { role: 'admin' | 'analista' | 'abogado' | 'cliente' | 'pending' };

const TestChild = () => <div>Protected Content</div>;

describe('PrivateRoute', () => {
  it('redirects to /login if not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute
                isAuthenticated={false}
                userProfile={null}
                allowedRoles={['admin']}
                redirectPath="/redirect"
              >
                <TestChild />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to redirectPath if user role is not allowed', () => {
    const userProfile: Profile = { role: 'cliente' };
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute
                isAuthenticated={true}
                userProfile={userProfile}
                allowedRoles={['admin']}
                redirectPath="/redirect"
              >
                <TestChild />
              </PrivateRoute>
            }
          />
          <Route path="/redirect" element={<div>Redirected Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Redirected Page')).toBeInTheDocument();
  });

  it('renders children if authenticated and role is allowed', () => {
    const userProfile: Profile = { role: 'admin' };
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute
                isAuthenticated={true}
                userProfile={userProfile}
                allowedRoles={['admin', 'analista']}
                redirectPath="/redirect"
              >
                <TestChild />
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});