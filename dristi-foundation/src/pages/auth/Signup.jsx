import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailBlur = (e) => {
    setFormData((current) => ({ ...current, email: e.target.value.trim() }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessNotice("");

    const email = formData.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address, such as you@example.com.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone.trim(),
            address: formData.address,
          },
        },
      });

      if (authError) throw authError;

      // Email confirmation is enabled in the Supabase project.
      if (authData?.session) {
        navigate("/events", { replace: true });
      } else if (authData?.user) {
        setSuccessNotice(
          `A confirmation link has been sent to ${email}. Open it to verify your email, then sign in.`,
        );
      }
    } catch (err) {
      let msg = err.message || "Failed to create account.";
      const errorMessage = msg.toLowerCase();
      if (
        err.code === "over_email_send_rate_limit" ||
        errorMessage.includes("email rate limit exceeded")
      ) {
        msg =
          "Too many verification emails have been requested. Please wait before trying again, or contact the site administrator to configure email delivery.";
      } else if (msg.includes("User already registered")) {
        msg = "This email is already registered. Please go to the Login page to sign in.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-2">
            <span className="text-2xl">👤</span>
          </div>
          <div className="inline-block mb-1">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Citizen Portal
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Citizen Account</h2>
          <p className="mt-1 text-xs text-gray-500">
            Confirm your email to create an account and apply for community programs.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {successNotice ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
            <div className="text-4xl">✉️</div>
            <h3 className="text-lg font-bold text-emerald-900">Check your email</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">{successNotice}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Go to Citizen Login →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Full name as per Aadhaar / ID"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                title="Enter a valid email address, such as you@example.com."
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Phone Number (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Your contact number"
                />
                <p className="mt-1 text-[11px] text-gray-500">For application follow-up only.</p>
              </div>

              <div>
                <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  City / Village
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g. Kumarghat"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Create Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100"
            >
              {loading ? "Creating Account..." : "Register Citizen Account →"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            Already registered as a citizen?{" "}
            <Link             to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Citizen Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
