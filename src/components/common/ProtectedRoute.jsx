import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

// Admin-only by default; pass requireAdmin={false} for pages any logged-in user may open
function ProtectedRoute({ children, requireAdmin = true }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        color: '#64748B',
        fontSize: '14px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
