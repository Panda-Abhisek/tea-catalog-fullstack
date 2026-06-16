import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ redirectPath = '/login', children }) => {
  const isAuthenticated = localStorage.getItem('access_token');
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to the specified login path, saving the attempted location for post-login redirect
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Render child routes if authenticated
  return children ? children : <Outlet />;
};

export default ProtectedRoute;