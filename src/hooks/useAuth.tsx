import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Agent } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  agent: Agent | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refetchAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refetchAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setAgent(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as unknown as Profile);
        if ((profileData as { role: string }).role === "agent") {
          const { data: agentData } = await supabase
            .from("agents")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();
          setAgent((agentData as unknown as Agent) ?? null);
        } else {
          setAgent(null);
        }
      } else {
        setProfile(null);
        setAgent(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try { await supabase.auth.signOut(); } finally {
      setUser(null); setProfile(null); setAgent(null); setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        refetchAuth();
      } else if (event === "SIGNED_OUT") {
        setUser(null); setProfile(null); setAgent(null); setLoading(false);
      }
    });
    return () => { subscription.unsubscribe(); };
  }, [refetchAuth]);

  return (
    <AuthContext.Provider value={{ user, profile, agent, loading, signOut, refetchAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};