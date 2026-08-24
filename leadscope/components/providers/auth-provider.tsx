'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  plan: 'free' | 'pro';
  full_name: string | null;
  email: string;
}

const AuthContext = createContext<{ user: User | null; profile: Profile | null; loading: boolean }>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user: current },
        } = await supabase.auth.getUser();
        setUser(current);

        if (current) {
          const { data } = await supabase
            .from('profiles')
            .select('plan, full_name, email')
            .eq('id', current.id)
            .single();
          setProfile(data);
        }
      } catch {
        // Supabase no disponible: se sigue como visitante anónimo.
      } finally {
        setLoading(false);
      }
    }
    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
