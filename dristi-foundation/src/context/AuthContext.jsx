import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
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
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, phone, address, role")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!active || request !== profileRequest) return;

        if (error) {
          // If table doesn't exist yet or query fails, provide fallback so user isn't stuck
          console.warn("Could not load profile from profiles table:", error.message);
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
        } else if (!data) {
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
          const { data: created } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .maybeSingle();

          setProfile(created || newProfile);
          setRole(created?.role || "user");
          setAuthError("");
        } else {
          setProfile(data);
          setRole(data.role || "user");
          setAuthError("");
        }
      } catch (err) {
        console.error("Profile load exception:", err);
        setRole("user");
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
    setAuthError("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin: role === "admin",
        loading,
        authError,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
