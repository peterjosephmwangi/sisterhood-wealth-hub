
import React from 'react';
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
  requireAny?: boolean; // If true, user needs ANY of the requiredRoles. If false, user needs ALL
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRole, 
  requiredRoles, 
  requireAny = true,
  fallback,
  showAccessDenied = true
}) => {
  const { hasRole, hasAnyRole, loading } = useUserRoles();

  if (loading) {
    return null; // Or a loading spinner if needed
  }

  // Check single role
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (showAccessDenied ? <AccessDeniedMessage /> : null);
  }

  // Check multiple roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = requireAny 
      ? hasAnyRole(requiredRoles)
      : requiredRoles.every(role => hasRole(role));

    if (!hasAccess) {
      return fallback || (showAccessDenied ? <AccessDeniedMessage /> : null);
    }
  }

  return <>{children}</>;
};

const AccessDeniedMessage: React.FC = () => (
  <Card className="max-w-md mx-auto">
    <CardContent className="flex flex-col items-center text-center p-6">
      <Shield className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
      <p className="text-muted-foreground">
        You don't have permission to access this feature.
      </p>
    </CardContent>
  </Card>
);

export default RoleGuard;
