import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api, { getErrorMessage, setAuthToken, setUnauthorizedHandler } from '../api';

const TOKEN_KEY = 'seatify_token';
const AuthContext = createContext(null);

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isUsableToken(token) {
  return typeof token === 'string' && token.split('.').length === 3 && getTokenExpiry(token) > Date.now();
}

function readStoredToken() {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (isUsableToken(token)) return token;
    sessionStorage.removeItem(TOKEN_KEY);
  } catch { /* Storage may be unavailable. */ }
  return null;
}

function storeToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch { /* Authentication still works without storage. */ }
}

function sanitizeUser(user) {
  if (!user || typeof user !== 'object') return null;
  return {
    id: user.id ?? user.userId ?? null,
    firstName: String(user.firstName ?? user.firstname ?? '').trim(),
    lastName: String(user.lastName ?? user.lastname ?? '').trim(),
    email: String(user.email ?? '').trim(),
    role: user.role ?? null,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const token = readStoredToken();
    return { token, user: null, status: token ? 'checking' : 'anonymous', error: null };
  });
  const currentSession = useRef({ token: session.token, version: 0 });
  const profileRequest = useRef(null);

  const logout = useCallback(() => {
    currentSession.current = { token: null, version: currentSession.current.version + 1 };
    profileRequest.current?.abort();
    profileRequest.current = null;
    setAuthToken(null);
    storeToken(null);
    setSession({ token: null, user: null, status: 'anonymous', error: null });
  }, []);

  const fetchUserProfile = useCallback(async () => {
    const { token, version } = currentSession.current;
    if (!token) return null;
    if (!isUsableToken(token)) {
      logout();
      return null;
    }
    profileRequest.current?.abort();
    const controller = new AbortController();
    profileRequest.current = controller;
    const isCurrent = () => !controller.signal.aborted
      && currentSession.current.version === version
      && profileRequest.current === controller;
    setSession({ token, user: null, status: 'checking', error: null });
    try {
      const response = await api.get('/users/me', { signal: controller.signal });
      if (!isCurrent()) return null;
      if (!isUsableToken(token)) {
        logout();
        return null;
      }
      const user = sanitizeUser(response.data);
      if (!user?.email) throw new Error('Invalid user profile response');
      setSession({ token, user, status: 'verified', error: null });
      return user;
    } catch (error) {
      if (!isCurrent()) return null;
      if (error.response?.status === 401) logout();
      else setSession({
        token, user: null, status: 'error',
        error: getErrorMessage(error, 'Unable to verify your session. Please try again.'),
      });
      return null;
    } finally {
      if (profileRequest.current === controller) profileRequest.current = null;
    }
  }, [logout]);

  const login = useCallback(async (token) => {
    if (!isUsableToken(token)) throw new Error('Login returned an invalid or expired token.');
    profileRequest.current?.abort();
    currentSession.current = { token, version: currentSession.current.version + 1 };
    setAuthToken(token);
    storeToken(token);
    return fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    const token = currentSession.current.token;
    if (token) {
      setAuthToken(token);
      fetchUserProfile();
    }
    return () => {
      currentSession.current.version += 1;
      profileRequest.current?.abort();
      profileRequest.current = null;
      setUnauthorizedHandler(null);
      setAuthToken(null);
    };
  }, [fetchUserProfile, logout]);

  useEffect(() => {
    if (!session.token) return undefined;
    const timer = setTimeout(logout, Math.max(0, getTokenExpiry(session.token) - Date.now()));
    return () => clearTimeout(timer);
  }, [session.token, logout]);

  const isAuthenticated = session.status === 'verified' && isUsableToken(session.token);
  return <AuthContext.Provider value={{
    user: isAuthenticated ? session.user : null,
    token: session.token,
    isAuthenticated,
    isAdmin: isAuthenticated && session.user?.role === 'ROLE_ADMIN',
    isNormalUser: isAuthenticated && session.user?.role === 'ROLE_USER',
    isLoading: session.status === 'checking',
    authError: session.status === 'error' ? session.error : null,
    login, logout, fetchUserProfile, retryProfile: fetchUserProfile,
  }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
