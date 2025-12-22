import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !authService.hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}





