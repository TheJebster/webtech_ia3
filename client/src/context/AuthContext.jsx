import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as loginApi,
  register as registerApi,
  getMe,
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((t, u) => {
    if (t) localStorage.setItem('token', t);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Re-fetch the current user from the API so the context reflects the database
  // (e.g. after an admin edits their own profile or a role changes).
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      logout();
      return null;
    }
    try {
      const res = await getMe();
      persist(storedToken, res.data);
      return res.data;
    } catch {
      logout();
      return null;
    }
  }, [persist, logout]);

  useEffect(() => {
    const bootstrap = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      // Optimistically restore the cached user so the first paint is instant...
      setToken(savedToken);
      setUser(readStoredUser());

      // ...then verify the token against the DB and refresh the user object.
      await refreshUser();
      setLoading(false);
    };

    bootstrap();
  }, [refreshUser]);

  const loginUser = async (email, password) => {
    const res = await loginApi({ email, password });
    const { token: t, user: u } = res.data;
    persist(t, u);
    return u;
  };

  const registerUser = async (name, email, password) => {
    const res = await registerApi({ name, email, password });
    const { token: t, user: u } = res.data;
    persist(t, u);
    return u;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, token, loading, loginUser, registerUser, logout, refreshUser, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};
