import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const {
    user,
    profile,
    isAdmin,
    adminMfaEnabled,
    assuranceLevel,
    signOut,
  } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  const handleSignOut = async () => {
    setSignOutError("");
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      setSignOutError(error.message);
    }
  };

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/our-work", label: "Our Work" },
    { to: "/updates", label: "Updates" },
  ];

  const citizenLinks =
    user && !isAdmin
      ? [
          { to: "/events", label: "Eye & Book Camps" },
          { to: "/my-applications", label: "My Applications" },
          { to: "/account/security", label: "Account Security" },
        ]
      : [];

  const adminLinks = isAdmin && adminMfaEnabled && assuranceLevel === "aal2"
    ? [
        { to: "/admin", label: "Dashboard" },
        { to: "/admin/events", label: "Manage Events" },
        { to: "/admin/posts", label: "Manage Posts" },
        { to: "/admin/registrations", label: "Registrations" },
      ]
    : [];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <img
                src="/logo.jpg"
                alt="Dristi Foundation logo"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100 bg-white shadow-sm"
              />
              <div>
                <span className="text-xl font-bold text-indigo-700 tracking-tight">
                  Dristi Foundation
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Tripura
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {citizenLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {adminLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Actions */}
            <div className="ml-3 pl-3 border-l border-gray-200 flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-800 leading-tight">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </div>
                    <span
                      className={`inline-block text-[10px] font-medium px-2 py-0.2 rounded-full ${
                        isAdmin
                          ? "bg-slate-900 text-amber-300"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {isAdmin ? "🛡️ Admin" : "👤 Citizen"}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-3 pt-3 pb-4 space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-indigo-700 hover:bg-indigo-50"
              >
                {link.label}
              </Link>
            ))}

            {citizenLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-700 bg-indigo-50/60"
              >
                {link.label}
              </Link>
            ))}

            {adminLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 bg-slate-100"
              >
                🛡️ {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-100">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 text-xs text-gray-500">
                    Logged in as:{" "}
                    <span className="font-semibold text-gray-800">
                      {profile?.full_name || user.email}
                    </span>{" "}
                    ({isAdmin ? "Admin" : "Citizen"})
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {signOutError && (
        <p role="alert" className="bg-red-50 px-4 py-2 text-center text-xs text-red-700">
          Unable to sign out: {signOutError}
        </p>
      )}
    </nav>
  );
}
