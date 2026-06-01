import React, { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api";

export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  session: { user: AppUser } | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signOut: async () => {},
  refresh: async () => {},
});

interface SignInResponse {
  user: AppUser;
  token?: string;
  redirect?: boolean;
}

async function fetchMe(): Promise<AppUser | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const data = await api.get<{ user: AppUser } | null>("/api/auth/get-session");
    return data?.user ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setUser(await fetchMe());
  };

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const res = await api.post<SignInResponse>("/api/auth/sign-in/email", {
        email,
        password,
      });
      if (res?.token) await setToken(res.token);
      if (res?.user) setUser(res.user);
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const res = await api.post<SignInResponse>("/api/auth/sign-up/email", {
        email,
        password,
        name: name ?? email.split("@")[0],
      });
      if (res?.token) await setToken(res.token);
      if (res?.user) setUser(res.user);
      return { error: null };
    } catch (err) {
      return { error: (err as Error).message };
    }
  };

  const signOut = async () => {
    try {
      await api.post("/api/auth/sign-out");
    } catch {
      // ignore
    }
    await setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user ? { user } : null,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
