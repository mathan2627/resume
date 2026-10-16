import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "recruiter" | "admin";
  profile?: any;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ token: string; user: any }>;
  register: (name: string, email: string, password: string, role: "student" | "recruiter" | "admin") => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ token: "", user: null }),
  register: async () => ({}),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("proofpath_token");
  });

  const loginMutation = useMutation(api.auth.login);
  const registerMutation = useMutation(api.auth.register);
  const logoutMutation = useMutation(api.auth.logout);

  const currentUserData = useQuery(api.auth.getCurrentUser, {
    token: token || undefined,
  });

  const isLoading = token !== null && currentUserData === undefined;
  const user = currentUserData || null;

  const handleLogin = async (email: string, password: string) => {
    const res = await loginMutation({ email, password });
    localStorage.setItem("proofpath_token", res.token);
    setToken(res.token);
    return res;
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    role: "student" | "recruiter" | "admin"
  ) => {
    const res = await registerMutation({ name, email, password, role });
    localStorage.setItem("proofpath_token", res.token);
    setToken(res.token);
    return res;
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await logoutMutation({ token });
      } catch (e) {
        console.warn("Logout error:", e);
      }
    }
    localStorage.removeItem("proofpath_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
