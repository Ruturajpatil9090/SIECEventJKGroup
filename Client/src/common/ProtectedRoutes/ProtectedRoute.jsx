import { Navigate, useLocation } from 'react-router-dom';
import { decryptData } from "../../common/Functions/DecryptData"

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const encryptedToken = sessionStorage.getItem('access_token');
  let isAuthenticated = false;

  if (encryptedToken) {
    try {
      const token = decryptData(encryptedToken);
      isAuthenticated = !!token;
    } catch (error) {
      console.error('Token validation error:', error);
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;