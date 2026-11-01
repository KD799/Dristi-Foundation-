import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [assuranceLevel, setAssuranceLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;
    let profileRequest = 0;

    const loadProfile = async (currentUser) => {
      const request = ++profileRequest;
      if (!currentUser) {
        setRole(null);
        setProfile(null);
        setAssuranceLevel(null);
        setLoading(false);
        return;
      }

      try {
        const [profileResult, assuranceResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, phone, address, role")
            .eq("id", currentUser.id)
            .maybeSingle(),
          supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        ]);

        if (!active || request !== profileRequest) return;

        if (assuranceResult.error) {
          throw assuranceResult.error;
        }
        setAssuranceLevel(assuranceResult.data.currentLevel);

        if (profileResult.error) {
          // If table doesn't exist yet or query fails, provide fallback so user isn't stuck
          console.warn("Could not load profile from profiles table:", profileResult.error.message);
          const fallback = {
            id: currentUser.id,
            full_name:
              currentUser.user_metadata?.full_name ||
              currentUser.email?.split("@")[0] ||
              "Citizen",
            phone: currentUser.user_metadata?.phone || "",
            address: currentUser.user_metadata?.address || "",
            role: "user",
          };
          setProfile(fallback);
          setRole("user");
          setAuthError("");
        } else if (!profileResult.data) {
          // User exists in auth.users but has no row in profiles
          const newProfile = {
            id: currentUser.id,
            full_name:
              currentUser.user_metadata?.full_name ||
              currentUser.email?.split("@")[0] ||
              "Citizen",
            phone: currentUser.user_metadata?.phone || "",
            address: currentUser.user_metadata?.address || "",
            role: "user",
          };

          // Try to insert it
          const { data: created, error: createError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .maybeSingle();

          if (createError) {
            console.warn("Could not create missing user profile:", createError.message);
          }
          setProfile(created || newProfile);
          setRole(created?.role || "user");
          setAuthError("");
        } else {
          setProfile(profileResult.data);
          setRole(profileResult.data.role || "user");
          setAuthError("");
        }
      } catch (err) {
        console.error("Profile load exception:", err);
        setRole("user");
        setAssuranceLevel(null);
        setProfile({
          id: currentUser.id,
          full_name: currentUser.email?.split("@")[0] || "User",
          role: "user",
        });
      } finally {
        if (active && request === profileRequest) {
          setLoading(false);
        }
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      void loadProfile(currentUser);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setAuthError("");
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          setLoading(true);
        }
        setTimeout(() => {
          if (active) void loadProfile(currentUser);
        }, 0);
      },
    );

    return () => {
      active = false;
      profileRequest += 1;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setRole(null);
    setAssuranceLevel(null);
    setAuthError("");
  };

  const refreshAssuranceLevel = async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) throw error;
    setAssuranceLevel(data.currentLevel);
    return data.currentLevel;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin: role === "admin",
        assuranceLevel,
        refreshAssuranceLevel,
        loading,
        authError,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
