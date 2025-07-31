
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
  requireAny?: boolean; // If true, user needs ANY of the requiredRoles. If false, user needs ALL
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredRoles, 
  requireAny = true 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { userRoles, loading: rolesLoading, hasRole, hasAnyRole } = useUserRoles();

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required role: {requiredRole}</p>
        </div>
      </div>
    );
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = requireAny 
      ? hasAnyRole(requiredRoles)
      : requiredRoles.every(role => hasRole(role));

    if (!hasAccess) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mt-2">
              Required roles: {requiredRoles.join(requireAny ? ' OR ' : ' AND ')}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
