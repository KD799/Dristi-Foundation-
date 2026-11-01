import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";

export default function Login({ adminOnly = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || authLoading) return;
    if (adminOnly && !isAdmin) {
      navigate("/events", { replace: true });
      return;
    }
    if (!adminOnly && isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }
    navigate(
      adminOnly ? "/admin" : location.state?.from?.pathname || "/events",
      { replace: true },
    );
  }, [user, isAdmin, authLoading, navigate, location.state, adminOnly]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      if (!data.user) throw new Error("Authentication failed. Please try again.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error(`Could not verify account permissions: ${profileError.message}`);
      }

      const expectedRole = adminOnly ? "admin" : "user";
      if (profile?.role !== expectedRole) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        if (!profile) {
          throw new Error("Could not verify account permissions. Please contact the administrator.");
        }
        throw new Error(
          adminOnly
            ? "This account is not authorized for administrator access."
            : "This is an administrator account. Use the administrator sign-in page.",
        );
      }
      navigate(adminOnly ? "/admin" : location.state?.from?.pathname || "/events", {
        replace: true,
      });
    } catch (loginError) {
      let message = loginError.message || "Unable to sign in. Please try again.";
      if (message.includes("Invalid login credentials")) {
        message = "Email or password is incorrect. If you just registered, confirm your email before signing in.";
      } else if (message.includes("Email not confirmed")) {
        message = "Please confirm your email using the link we sent before signing in.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-b from-indigo-700 via-indigo-600 to-indigo-700 text-white">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-3 border border-white/20">
            <span className="text-2xl">{adminOnly ? "🛡️" : "👤"}</span>
          </div>
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
            Dristi Foundation
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-3">
            {adminOnly ? "Administrator sign in" : "Sign in"}
          </h1>
          <p className="mt-1 text-sm text-indigo-100/90">
            {adminOnly
              ? "Authorized administrators only. Sign in with your administrator account."
              : "Sign in with your email and password to continue."}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          {!adminOnly && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                New citizen / applicant?{" "}
                <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
