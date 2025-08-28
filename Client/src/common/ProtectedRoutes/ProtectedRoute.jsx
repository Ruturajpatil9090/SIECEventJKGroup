import { Navigate, useLocation } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_REACT_APP_API_ENCRYPTION_KEY;

// const ENCRYPTION_KEY = 'sdfsdfsdfsdfsdfsdf54sd5f465sdf4sd4f654sdf46s4d6f6sdf645sd';

// Helper function to decrypt data
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Check if access token exists and is valid
  const encryptedToken = sessionStorage.getItem('access_token');
  let isAuthenticated = false;
  
  if (encryptedToken) {
    try {
      const token = decryptData(encryptedToken);
      // You might want to add additional token validation here
      // (e.g., check expiration if your token has that information)
      isAuthenticated = !!token;
    } catch (error) {
      console.error('Token validation error:', error);
      isAuthenticated = false;
    }
  }
  
  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;