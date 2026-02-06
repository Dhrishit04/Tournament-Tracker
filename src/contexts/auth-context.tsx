
import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'SYSTEM_ADMIN' | 'ADMIN' | 'USER';
  canAccessSettings?: boolean;
}

export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isSystemAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  isAdmin: false,
  isSystemAdmin: false,
  login: async () => {},
  logout: async () => {},
  loading: true,
});
