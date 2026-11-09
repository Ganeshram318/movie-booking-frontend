
import {
  createContext,
  useContext,
  useState,
  useCallback
} from 'react';

import api, { setAuthToken } from '../api';

const AuthContext = createContext(null);

// Clean and normalize user details
function sanitizeUser(user) {
  if (!user || typeof user !== 'object') {
    return null;
  }

  return {
    id: user.id ?? user.userId ?? null,
    firstName: String(
      user.firstName ?? user.firstname ?? ''
    ).trim(),
    lastName: String(
      user.lastName ?? user.lastname ?? ''
    ).trim(),
    email: String(user.email ?? '').trim(),
    role: user.role ?? null
  };
}

export function AuthProvider({ children }) {

  // JWT and user data stay in memory
  const [token, setToken] = useState(null);
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login
  const login = useCallback((jwtToken, userData = null) => {
    if (!jwtToken) {
      return;
    }

    // Set Axios token immediately
    setAuthToken(jwtToken);
    setToken(jwtToken);

    if (userData) {
      setUserState(sanitizeUser(userData));
    } else {
      setUserState(null);
    }
  }, []);

  // Update user details
  const setUser = useCallback((userData) => {
    const safeUser = sanitizeUser(userData);
    setUserState(safeUser);
  }, []);

  // Fetch logged-in user details
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await api.get('/users/me');

      const profileData = sanitizeUser(response.data);

      if (!profileData?.email) {
        throw new Error('Invalid user profile response');
      }

      setUserState(profileData);

      return profileData;

    } catch (error) {
      console.error('Error fetching user profile:', error);

      setUserState(null);

      return null;

    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUserState(null);
    setIsLoading(false);
  }, []);

  // Authentication status
  const isAuthenticated = Boolean(token);

  // Role-based access
  const isAdmin =
    isAuthenticated && user?.role === 'ROLE_ADMIN';

  const isNormalUser =
    isAuthenticated && user?.role === 'ROLE_USER';

  // Temporary debugging
  console.log('Current Role:', user?.role);
  console.log('Is Admin:', isAdmin);
  console.log('Is Authenticated:', isAuthenticated);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isNormalUser,
        isLoading,
        setIsLoading,
        setUser,
        login,
        logout,
        fetchUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}
