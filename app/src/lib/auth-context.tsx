'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabaseGetUser, supabaseAuthSignOut, supabaseSelect } from './supabase';
import type { User } from './models/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    const accessToken = localStorage.getItem('rts_access_token');
    if (!accessToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      if (pathname !== '/login') router.push('/login');
      return;
    }

    try {
      // 1. Verificar token con Supabase Auth
      const authData = await supabaseGetUser(accessToken);
      if (!authData || !authData.id) {
        throw new Error('Sesión inválida');
      }

      // 2. Buscar perfil en public.users vinculado al id de auth
      // Nota: asumo que id en public.users coincide o hay un campo auth_id. 
      // Por consistencia con el seed, usamos id de public.users
      const profile = await supabaseSelect<User>('users', {
        eq: ['id', authData.id],
        single: true,
        token: accessToken
      });

      if (profile && profile.length > 0) {
        setUser(profile[0]);
        setToken(accessToken);
      } else {
        // Si no hay perfil pero hay auth, crear uno o manejar error
        console.warn('Usuario autenticado sin perfil en public.users');
        setUser(null);
      }
    } catch (e) {
      console.error('Auth verify failed:', e);
      localStorage.removeItem('rts_access_token');
      setUser(null);
      setToken(null);
      if (pathname !== '/login') router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    const t = localStorage.getItem('rts_access_token');
    if (t) await supabaseAuthSignOut(t);
    localStorage.removeItem('rts_access_token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, refreshUser }}>
      {!loading ? children : (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>
          <div className="spinner"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
