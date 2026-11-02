import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";

export default function AccountSecurity() {
  const { isAdmin, refreshAssuranceLevel } = useAuth();
  const [factor, setFactor] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const beginSetup = async () => {
    setError("");
    setLoading(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .maybeSingle();
      if (profileError) throw profileError;
      if (profile?.role !== "user" && profile?.role !== "admin") {
        throw new Error(
          "Authenticator setup is available only for citizen and administrator accounts.",
        );
      }

      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      if (factors.totp.length > 0) {
        setEnabled(true);
        return;
      }

      for (const pendingFactor of factors.all.filter(
        (item) => item.factor_type === "totp" && item.status === "unverified",
      )) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: pendingFactor.id,
        });
        if (unenrollError) throw unenrollError;
      }

      const { data: enrollment, error: enrollmentError } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "Dristi Foundation account",
        });
      if (enrollmentError) throw enrollmentError;

      setFactor({
        id: enrollment.id,
        qrCode: enrollment.totp.qr_code,
        secret: enrollment.totp.secret,
      });
    } catch (setupError) {
      setError(setupError.message || "Unable to start authenticator setup.");
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async (event) => {
    event.preventDefault();
    if (!factor) return;
    setError("");
    setLoading(true);

    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;

      await refreshAssuranceLevel();
      setFactor(null);
      setEnabled(true);
      setCode("");
    } catch (verificationError) {
      setError(verificationError.message || "The verification code was not accepted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Account security</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Set up a free authenticator app such as Google Authenticator or
          Microsoft Authenticator. This does not use SMS.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {enabled ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              A verified authenticator is already enabled for this account.
            </p>
            {isAdmin && (
              <>
                <p className="text-sm leading-relaxed text-gray-600">
                  Your administrator role is unchanged. Admin access still
                  requires a verified MFA session and project-owner approval.
                </p>
                <Link
                  to="/admin/login"
                  className="inline-flex font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Continue to administrator sign in
                </Link>
              </>
            )}
            {!isAdmin && (
              <p className="text-sm leading-relaxed text-gray-600">
                If this account is being prepared for administrator access, ask
                the project owner to verify your identity and authenticator setup
                through a trusted channel before assigning the admin role.
              </p>
            )}
          </div>
        ) : factor ? (
          <form onSubmit={verifySetup} className="mt-6 space-y-5">
            <div className="space-y-3 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Scan with your authenticator app
              </h2>
              <img
                src={factor.qrCode}
                alt="Authenticator setup QR code"
                className="mx-auto h-48 w-48 rounded-lg border border-gray-200 p-2"
              />
              <details className="text-left text-xs text-gray-600">
                <summary className="cursor-pointer font-medium">
                  Can’t scan the code?
                </summary>
                <p className="mt-2 break-all rounded bg-gray-50 p-3 font-mono">
                  {factor.secret}
                </p>
              </details>
              <p className="text-sm text-gray-600">
                Enter the current six-digit code from the app to verify setup.
              </p>
            </div>
            <div>
              <label
                htmlFor="account-security-code"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700"
              >
                Authenticator code
              </label>
              <input
                id="account-security-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg tracking-[0.4em] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="000000"
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify authenticator"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm leading-relaxed text-gray-600">
              {isAdmin
                ? "You can enroll here without changing your administrator role. Admin tools remain protected until you verify this authenticator and the project owner approves access."
                : "For administrator onboarding, complete this setup before the project owner grants admin access. The owner should confirm your identity and successful setup through a trusted channel."}
            </p>
            <button
              type="button"
              onClick={beginSetup}
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Preparing setup…" : "Set up authenticator"}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Back to citizen portal
          </Link>
        </div>
      </section>
    </div>
  );
}
