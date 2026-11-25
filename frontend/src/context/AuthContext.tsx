import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { tokenStorage, extractErrorMessage } from '../api/client';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());

  const login = useCallback(async (username: string, password: string) => {
    try {
      const { data } = await authApi.login(username, password);
      tokenStorage.set(data.token);
      setToken(data.token);
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    try {
      await authApi.register(username, password);
      await authApi.login(username, password).then(({ data }) => {
        tokenStorage.set(data.token);
        setToken(data.token);
      });
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), login, register, logout }),
    [token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}