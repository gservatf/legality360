import React from 'react';
import { Navigate } from 'react-router-dom';
import { Profile } from '@/lib/supabase';

interface PrivateRouteProps {
  isAuthenticated: boolean;
  userProfile: Profile | null;
  allowedRoles: Profile['role'][];
  redirectPath: string;
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  isAuthenticated,
  userProfile,
  allowedRoles,
  redirectPath,
  children,
}) => {
  if (!isAuthenticated || !userProfile) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(userProfile.role)) {
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
};
