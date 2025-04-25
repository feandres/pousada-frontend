import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthProvider';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const auth = useContext(AuthContext);

  if (auth?.isLoading) {
    return <div>Loading...</div>;
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};