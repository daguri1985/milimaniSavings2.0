'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
  ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface MemberProfile {
  id: string;
  full_name: string;
  role: string;
  email: string;
  member_number?: string;
  phone_number?: string;
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  profile: MemberProfile | null;
  loading: boolean;
  mounted: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper hook for clean, hydration-safe mounted state using React 18+ standards
const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,  // Client value
    () => false  // Server (SSR) value
  );
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hydration safety without triggering ESLint set-state-in-effect errors
  const mounted = useIsMounted();

  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, role, email, status, phone_number')
        .eq('email', currentUser.email)
        .maybeSingle();

      if (error) {
        console.error('Error fetching member profile:', error.message);
      }

      if (data) {
        setProfile(data as MemberProfile);
      } else {
        setProfile({
          id: currentUser.id,
          full_name:
            currentUser.user_metadata?.full_name ||
            currentUser.email?.split('@')[0] ||
            'Member',
          role: currentUser.user_metadata?.role || 'Member',
          email: currentUser.email || '',
        });
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  useEffect(() => {
    if (!mounted) return;

    let isSubscribed = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: activeSession },
        } = await supabase.auth.getSession();

        if (isSubscribed) {
          setSession(activeSession);
          const currentUser = activeSession?.user ?? null;
          setUser(currentUser);

          if (currentUser) {
            await fetchProfile(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!isSubscribed) return;

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [mounted, fetchProfile]);

  return (
    <UserContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        mounted,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}