import { useEffect, useState } from "react";
import {
  getAllRegistrations,
  updateRegistrationStatus,
} from "../../services/registrationService";
import Loader from "../../components/Loader";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const loadRegistrations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllRegistrations();
      setRegistrations(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try {
      await updateRegistrationStatus(id, status);
      await loadRegistrations();
    } catch (updateError) {
      setError(`Failed to update registration: ${updateError.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const filtered =
    filter === "all"
      ? registrations
      : registrations.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Registrations</h1>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "⏳ Pending" },
            { value: "approved", label: "✅ Approved" },
            { value: "rejected", label: "❌ Rejected" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-5xl mb-4">📋</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Registrations
            </h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "No registrations have been submitted yet."
                : `No ${filter} registrations found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((reg) => (
              <div
                key={reg.id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {reg.profiles?.full_name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {reg.posts?.title || reg.events?.title || "Application"} (
                      {reg.posts?.application_category_label ||
                        reg.posts?.application_category?.replace("_", " ") ||
                        reg.events?.type?.replace("_", " ") ||
                        "application"}) •
                      Phone: {reg.profiles?.phone || "N/A"} •
                      Applied:{" "}
                      {new Date(reg.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      statusStyles[reg.status] || statusStyles.pending
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>

                {/* Registration Details */}
                {reg.details && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                      {Object.entries(reg.details)
                        .filter(([, v]) => v)
                        .map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-500 capitalize block">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <span className="font-medium text-gray-900">
                              {value}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {reg.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusChange(reg.id, "approved")}
                      disabled={updating === reg.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                      {updating === reg.id ? "..." : "✅ Approve"}
                    </button>
                    <button
                      onClick={() => handleStatusChange(reg.id, "rejected")}
                      disabled={updating === reg.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                      {updating === reg.id ? "..." : "❌ Reject"}
                    </button>
                  </div>
                )}
                {reg.status !== "pending" && (
                  <button
                    onClick={() => handleStatusChange(reg.id, "pending")}
                    disabled={updating === reg.id}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Reset to Pending
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
