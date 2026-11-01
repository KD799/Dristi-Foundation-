import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const typeLabels = {
  eye_camp: {
    label: "Eye Checkup Camp",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "👁️",
    action: "Register for Eye Camp",
    link: (id) => `/register/eye-camp/${id}`,
  },
  book_distribution: {
    label: "Free Book Distribution",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "📚",
    action: "Apply for Books",
    link: (id) => `/apply/books/${id}`,
  },
  flood_relief: {
    label: "Flood & Disaster Relief",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "🌊",
    action: "Request Relief Aid",
    link: (id) => `/register/eye-camp/${id}`, // general registration
  },
  other: {
    label: "Community Program",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "📋",
    action: "Register for Program",
    link: (id) => `/register/eye-camp/${id}`,
  },
};

export default function EventCard({ event }) {
  const { user } = useAuth();
  const typeInfo = typeLabels[event.type] || typeLabels.other;

  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Date to be announced";

  const registerLink = typeInfo.link(event.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col h-full overflow-hidden group">
      <div className="p-6 flex-1 flex flex-col">
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeInfo.color}`}
          >
            <span>{typeInfo.icon}</span>
            <span>{typeInfo.label}</span>
          </span>

          {event.registration_open ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Registration Open
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              Closed
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
          {event.title}
        </h3>

        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6 flex-1">
          {event.description || "No specific details provided for this camp. Registration is open to all eligible citizens."}
        </p>

        {/* Metadata pills */}
        <div className="space-y-2 pt-4 border-t border-gray-100 text-xs text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <span className="font-medium text-gray-800">{eventDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base">📍</span>
            <span className="font-medium text-gray-800">
              {event.location || "143 Pura, Kumarghat, Tripura"}
            </span>
          </div>
        </div>

        {/* Action Button */}
        {event.registration_open ? (
          user ? (
            <Link
              to={registerLink}
              className="w-full text-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <span>{typeInfo.action}</span>
              <span>→</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full text-center py-2.5 px-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span>👤 Sign In as Citizen to Register</span>
            </Link>
          )
        ) : (
          <button
            disabled
            className="w-full py-2.5 px-4 bg-gray-100 text-gray-400 rounded-xl text-xs font-semibold cursor-not-allowed text-center"
          >
            Registration Completed / Closed
          </button>
        )}
      </div>
    </div>
  );
}
