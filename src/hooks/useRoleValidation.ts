
import { useUserRoles, AppRole } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';

export const useRoleValidation = () => {
  const { hasRole, hasAnyRole } = useUserRoles();
  const { toast } = useToast();

  const validateRole = (requiredRole: AppRole, action?: string): boolean => {
    if (!hasRole(requiredRole)) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to ${action || 'perform this action'}. Required role: ${requiredRole}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateAnyRole = (requiredRoles: AppRole[], action?: string): boolean => {
    if (!hasAnyRole(requiredRoles)) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to ${action || 'perform this action'}. Required roles: ${requiredRoles.join(' or ')}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateAdminAction = (action?: string): boolean => {
    return validateRole('admin', action);
  };

  const validateFinanceAction = (action?: string): boolean => {
    return validateAnyRole(['admin', 'treasurer'], action);
  };

  const validateMeetingAction = (action?: string): boolean => {
    return validateAnyRole(['admin', 'secretary', 'chairperson'], action);
  };

  return {
    validateRole,
    validateAnyRole,
    validateAdminAction,
    validateFinanceAction,
    validateMeetingAction,
  };
};
