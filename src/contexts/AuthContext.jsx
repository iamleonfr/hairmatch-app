import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../supabaseClient';
import supabaseApi from '../api/supabaseAdapter';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const u = await supabaseApi.auth.me();
      if (!mounted) return;
      setUser(u);
      setLoading(false);
    }
    load();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // When auth state changes, re-fetch profile
      supabaseApi.auth.me().then(setUser).catch(() => setUser(null));
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signup = async (email, password, username) => {
    const res = await supabaseApi.signUpWithPassword(email, password, username);
    setUser(res.profile || null);
    return res;
  };

  const login = async (email, password) => {
    const res = await supabaseApi.signInWithPassword(email, password);
    setUser(res.profile || null);
    return res;
  };

  const logout = async () => {
    await supabaseApi.logout('/');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
