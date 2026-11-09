
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';

import api, { setAuthToken, setUnauthorizedHandler } from '../api';

const TOKEN_KEY = 'seatify_token';

// Returns the JWT expiry in ms, or null when it cannot be read
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Token is kept in sessionStorage (cleared when the tab closes) so a page refresh keeps the user logged in
function readStoredToken() {
  try {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (!stored) {
      return null;
    }
    const expiry = getTokenExpiry(stored);
    if (expiry !== null && expiry <= Date.now()) {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
    setAuthToken(stored);
    return stored;
  } catch {
    return null;
  }
}

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

  const [token, setToken] = useState(readStoredToken);
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
    try {
      sessionStorage.setItem(TOKEN_KEY, jwtToken);
    } catch {
      // Storage unavailable: session lasts until refresh
    }

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

      // Without a profile the role is unknown, so end the session instead of staying half logged in
      setAuthToken(null);
      setToken(null);
      setUserState(null);
      try {
        sessionStorage.removeItem(TOKEN_KEY);
      } catch {
        // Ignore storage errors
      }

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
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Restore the profile after a refresh
  useEffect(() => {
    if (token && !user) {
      fetchUserProfile();
    }
    // Only when the token changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Log out when the JWT expires while the app is open
  useEffect(() => {
    if (!token) {
      return undefined;
    }
    const expiry = getTokenExpiry(token);
    if (expiry === null) {
      return undefined;
    }
    const timer = setTimeout(logout, Math.max(0, expiry - Date.now()));
    return () => clearTimeout(timer);
  }, [token, logout]);

  // Authentication status
  const isAuthenticated = Boolean(token);

  // Role-based access
  const isAdmin =
    isAuthenticated && user?.role === 'ROLE_ADMIN';

  const isNormalUser =
    isAuthenticated && user?.role === 'ROLE_USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isNormalUser,
        isLoading: isLoading || (isAuthenticated && !user),
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
