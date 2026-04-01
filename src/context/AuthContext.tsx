import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null, 
  profile: null,
  loading: true,
  updateProfile: async () => {},
  signOut: async () => {} 
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
      if (error) throw error;
      setProfile(data);
    } catch (e) {
      console.warn("Falling back to local profile storage", e);
      const localStr = localStorage.getItem(`profile_${currentUser.id}`);
      if (localStr) {
        setProfile(JSON.parse(localStr));
      } else {
        setProfile({ id: currentUser.id, email: currentUser.email, onboarding_completed: false });
      }
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const newProfile = { ...profile, ...updates, id: user.id } as UserProfile;
    setProfile(newProfile);
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(newProfile));
    
    try {
      await supabase.from('profiles').upsert(newProfile);
    } catch(e) {
      console.warn("Could not sync profile to cloud, saved locally", e);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
