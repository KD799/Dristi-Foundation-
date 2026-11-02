import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";

export default function Login({ adminOnly = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    role,
    adminMfaEnabled,
    assuranceLevel,
    loading: authLoading,
    refreshAssuranceLevel,
    signOut,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaStarting, setMfaStarting] = useState(false);
  const [mfaFlow, setMfaFlow] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const mfaStartedForUser = useRef(null);
  const needsOwnerApproval = role === "admin" && !adminMfaEnabled;

  const startAdminMfa = useCallback(async (userId) => {
    if (mfaStartedForUser.current === userId) return;
    mfaStartedForUser.current = userId;
    setError("");
    setMfaStarting(true);

    try {
      const { data: assurance, error: assuranceError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) throw assuranceError;
      if (assurance.currentLevel === "aal2") {
        navigate("/admin", { replace: true });
        return;
      }

      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const verifiedTotp = factors.totp[0];
      if (verifiedTotp) {
        setMfaFlow({ type: "challenge", factorId: verifiedTotp.id });
        return;
      }

      setMfaFlow({ type: "missing" });
      setError(
        "No verified authenticator is enrolled for this administrator account. Set one up in Account Security to continue.",
      );
    } finally {
      setMfaStarting(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || authLoading) return;
    if (adminOnly) {
      if (role !== "admin") {
        navigate("/events", { replace: true });
      } else if (!adminMfaEnabled) {
        return;
      } else if (assuranceLevel === "aal2") {
        navigate("/admin", { replace: true });
      } else {
        void startAdminMfa(user.id).catch((mfaError) => {
          setError(mfaError.message || "Unable to start administrator verification.");
        });
      }
      return;
    }
    if (role === "admin") {
      navigate(
        adminMfaEnabled && assuranceLevel === "aal2" ? "/admin" : "/admin/login",
        { replace: true },
      );
      return;
    }
    navigate(location.state?.from?.pathname || "/events", { replace: true });
  }, [
    user,
    role,
    adminMfaEnabled,
    assuranceLevel,
    authLoading,
    navigate,
    location.state,
    adminOnly,
    startAdminMfa,
  ]);

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
        .select("role, admin_mfa_enabled")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error(`Could not verify account permissions: ${profileError.message}`);
      }

      const expectedRole = adminOnly ? "admin" : "user";
      if (
        profile?.role !== expectedRole ||
        (adminOnly && profile.admin_mfa_enabled !== true)
      ) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        if (!profile) {
          throw new Error(
            "No profile record is visible for this account. The project owner should run supabase/schema.sql in Supabase, then try again.",
          );
        }
        if (adminOnly && profile.role === "admin") {
          throw new Error(
            "Administrator access is not enabled for this account. The project owner must verify your authenticator setup and approve admin MFA access.",
          );
        }
        throw new Error(
          adminOnly
            ? "This account is not authorized for administrator access."
            : "This is an administrator account. Use the administrator sign-in page.",
        );
      }
      if (adminOnly) {
        await startAdminMfa(data.user.id);
      } else {
        navigate(location.state?.from?.pathname || "/events", {
          replace: true,
        });
      }
    } catch (loginError) {
      if (adminOnly && user?.id) {
        mfaStartedForUser.current = user.id;
      }
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

  const handleMfaVerification = async (event) => {
    event.preventDefault();
    if (!mfaFlow) return;
    setError("");
    setLoading(true);

    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: mfaFlow.factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFlow.factorId,
        challengeId: challenge.id,
        code: verificationCode.trim(),
      });
      if (verifyError) throw verifyError;

      const verifiedLevel = await refreshAssuranceLevel();
      if (verifiedLevel !== "aal2") {
        throw new Error("Administrator verification did not complete. Please try again.");
      }
      navigate("/admin", { replace: true });
    } catch (verificationError) {
      setError(verificationError.message || "The verification code was not accepted.");
    } finally {
      setLoading(false);
      setVerificationCode("");
    }
  };

  const retryMfaChallenge = () => {
    if (!user) return;
    mfaStartedForUser.current = null;
    void startAdminMfa(user.id).catch((mfaError) => {
      setError(mfaError.message || "Unable to start administrator verification.");
    });
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
          {needsOwnerApproval && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              Administrator access is not enabled. The project owner must
              verify your authenticator setup and approve admin MFA access.
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {error}
            </div>
          )}

          {adminOnly && mfaStarting && (
            <p className="mb-5 text-sm text-gray-600" role="status">
              Preparing secure administrator verification…
            </p>
          )}

          {adminOnly && error && !mfaFlow && user?.id && (
            <button
              type="button"
              onClick={retryMfaChallenge}
              disabled={mfaStarting}
              className="mb-5 w-full rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
            >
              Retry authenticator check
            </button>
          )}

          {adminOnly && needsOwnerApproval ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-gray-700">
                The project owner must verify your identity and authenticator
                setup through a trusted channel, then enable administrator MFA
                approval for this account.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signOut();
                    navigate("/login", { replace: true });
                  } catch (signOutError) {
                    setError(signOutError.message || "Unable to sign out.");
                  }
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          ) : adminOnly && mfaFlow?.type === "missing" ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-gray-700">
                This administrator account has no verified authenticator yet.
                You are signed in, but administrator tools remain locked until
                you enroll and verify a factor.
              </p>
              <Link
                to="/account/security"
                className="block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white hover:bg-indigo-700"
              >
                Set up authenticator
              </Link>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await signOut();
                    navigate("/login", { replace: true });
                  } catch (signOutError) {
                    setError(signOutError.message || "Unable to sign out.");
                  }
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          ) : adminOnly && mfaFlow?.type === "challenge" ? (
            <form onSubmit={handleMfaVerification} className="space-y-5">
              <div className="space-y-2 text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Verify it’s you
                </h2>
                <p className="text-sm text-gray-600">
                  Enter the current six-digit code from your authenticator app.
                </p>
              </div>
              <div>
                <label
                  htmlFor="mfa-code"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
                >
                  Authenticator code
                </label>
                <input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(event) =>
                    setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.4em] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify and continue"}
              </button>
            </form>
          ) : !needsOwnerApproval && !mfaFlow && (!mfaStarting || !user) ? (
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
          ) : null}

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
