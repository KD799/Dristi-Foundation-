import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyRegistrations } from "../../services/registrationService";
import Loader from "../../components/Loader";

const statusStyles = {
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Under Review ⏳",
    message: "Your application is currently being reviewed by our coordinators. You will receive updates here.",
  },
  approved: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Approved & Confirmed ✅",
    message: "Your registration is confirmed! Please bring this acknowledgement or Aadhaar to the event venue.",
  },
  rejected: {
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Not Approved ✕",
    message: "This registration could not be approved due to capacity or criteria. Feel free to apply for subsequent camps.",
  },
};

export default function MyApplications() {
  const { user, profile } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user) {
      getMyRegistrations(user.id)
        .then(setRegistrations)
        .catch((loadError) => setError(loadError.message))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const filtered =
    statusFilter === "all"
      ? registrations
      : registrations.filter((r) => r.status === statusFilter);

  const pendingCount = registrations.filter((r) => r.status === "pending").length;
  const approvedCount = registrations.filter((r) => r.status === "approved").length;

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Citizen Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                Citizen Beneficiary Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
                My Registrations & Applications
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                Applicant: <strong>{profile?.full_name || user?.email}</strong> •{" "}
                {profile?.phone || user?.email}
              </p>
            </div>

            <Link
              to="/events"
              className="self-start sm:self-auto px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>+</span> Register for New Camp
            </Link>
          </div>

          {/* Stat counters */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <span className="text-lg sm:text-2xl font-bold">{registrations.length}</span>
              <p className="text-[10px] sm:text-xs text-indigo-200 uppercase font-medium">Total</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <span className="text-lg sm:text-2xl font-bold text-amber-300">{pendingCount}</span>
              <p className="text-[10px] sm:text-xs text-indigo-200 uppercase font-medium">Pending</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
              <span className="text-lg sm:text-2xl font-bold text-emerald-300">{approvedCount}</span>
              <p className="text-[10px] sm:text-xs text-indigo-200 uppercase font-medium">Approved</p>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { value: "all", label: "All Applications" },
            { value: "pending", label: "⏳ Pending Review" },
            { value: "approved", label: "✅ Approved" },
            { value: "rejected", label: "✕ Rejected" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === tab.value
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-100"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <p role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
            {error}
          </p>
        ) : loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <span className="text-5xl mb-3 block">📋</span>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {statusFilter === "all"
                ? "No applications found"
                : `No ${statusFilter} applications`}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              You haven&apos;t applied to any updates, camps, or book drives under this status yet.
            </p>
            <Link
              to="/updates"
              className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Browse Updates & Applications →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((reg) => {
              const status = statusStyles[reg.status] || statusStyles.pending;
              const eventDate = reg.events?.event_date
                ? new Date(reg.events.event_date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Date announced soon";

              const appliedDate = new Date(reg.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={reg.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">
                          {reg.posts?.work_category === "eye_camp" || reg.events?.type === "eye_camp"
                            ? "👁️"
                            : reg.posts?.work_category === "book_distribution" ||
                                reg.events?.type === "book_distribution"
                            ? "📚"
                            : reg.posts?.work_category === "flood_relief" ||
                                reg.events?.type === "flood_relief"
                              ? "🌊"
                              : "📋"}
                        </span>
                        <h3 className="text-base font-bold text-gray-900">
                          {reg.posts?.title || reg.events?.title || "Application"}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                        {reg.events && (
                          <span>📅 Event Date: <strong>{eventDate}</strong></span>
                        )}
                        {reg.posts?.application_category_label && (
                          <span>Type: <strong>{reg.posts.application_category_label}</strong></span>
                        )}
                        {reg.events?.location && (
                          <span>📍 Venue: <strong>{reg.events.location}</strong></span>
                        )}
                        <span>Applied on: {appliedDate}</span>
                      </div>
                    </div>

                    <span
                      className={`self-start text-xs font-bold px-3 py-1 rounded-full border ${status.badge}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Status Advisory Note */}
                  <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-sm">ℹ️</span>
                    <p className="leading-relaxed">{status.message}</p>
                  </div>

                  {/* Submitted Application Details */}
                  {reg.details && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                        Submitted Application Details:
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-xs">
                        {Object.entries(reg.details)
                          .filter(([, v]) => v)
                          .map(([key, val]) => (
                            <div key={key}>
                              <span className="text-gray-400 capitalize block text-[11px]">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span className="font-semibold text-gray-800 break-words">
                                {String(val)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Acknowledgment Slip Footer */}
                  <div className="mt-4 pt-3 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Application ID: <code className="text-gray-600 font-mono">{reg.id.slice(0, 8)}</code>
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <span>🖨️</span> Print Slip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
