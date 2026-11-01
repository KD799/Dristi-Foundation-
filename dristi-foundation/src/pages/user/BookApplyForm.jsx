import { useState, useEffect } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createRegistration } from "../../services/registrationService";
import { getEvent } from "../../services/eventService";
import Loader from "../../components/Loader";

export default function BookApplyForm() {
  const { eventId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    studentName: "",
    age: "",
    className: "",
    school: "",
    guardianName: "",
    phone: "",
    address: "",
    booksNeeded: "",
    annualIncome: "Below ₹1,00,000",
    notes: "",
  });

  useEffect(() => {
    if (eventId) {
      getEvent(eventId)
        .then(setEventData)
        .catch((e) => console.warn("Could not fetch event:", e.message))
        .finally(() => setFetchingEvent(false));
    } else {
      setFetchingEvent(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        guardianName: prev.guardianName || profile.full_name || "",
        phone: prev.phone || profile.phone || "",
        address: prev.address || profile.address || "",
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createRegistration({
        user_id: user.id,
        event_id: eventId || null,
        details: formData,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEvent) {
    return <Loader />;
  }

  if (!eventId) {
    return <Navigate to="/updates" replace />;
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            📚
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Application Received
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-2">
            Book Application Submitted!
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            Your application for student textbook support under{" "}
            <strong>{eventData?.title || "Book Distribution Drive"}</strong> has been received.
            Our education team will review and notify you about book collection dates.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/my-applications")}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition-all"
            >
              View in My Applications →
            </button>
            <Link
              to="/events"
              className="block w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-all text-center"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-700 mb-6 transition-colors"
        >
          <span>←</span> Back to Upcoming Events
        </Link>

        {eventData && (
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 rounded-2xl shadow-sm mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              Distribution Drive
            </span>
            <h2 className="text-xl font-bold mt-2 mb-1">{eventData.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100 mt-2">
              {eventData.event_date && (
                <span>
                  📅{" "}
                  {new Date(eventData.event_date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
              {eventData.location && <span>📍 {eventData.location}</span>}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 mb-2">
              <span className="text-xl">📚</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Apply for Free Textbooks & Study Materials
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              For school and college students in Tripura from economically weaker backgrounds.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2"
            >
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="studentName"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Student Name *
                </label>
                <input
                  id="studentName"
                  name="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Full name of student"
                />
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Student Age *
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="4"
                  max="30"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 14"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="className"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Class / Academic Standard *
                </label>
                <select
                  id="className"
                  name="className"
                  required
                  value={formData.className}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="">Select Class</option>
                  <option value="Class 1-5 (Primary)">Class 1 - 5 (Primary)</option>
                  <option value="Class 6-8 (Middle)">Class 6 - 8 (Middle)</option>
                  <option value="Class 9-10 (Secondary / Madhyamik)">
                    Class 9 - 10 (Madhyamik / TBSE)
                  </option>
                  <option value="Class 11-12 (Higher Secondary)">
                    Class 11 - 12 (Higher Secondary)
                  </option>
                  <option value="Undergraduate / College">Undergraduate / Degree College</option>
                  <option value="Competitive Exam / Entrance">Competitive Exam / Entrance</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="school"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  School / College Institution *
                </label>
                <input
                  id="school"
                  name="school"
                  required
                  value={formData.school}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Kumarghat Higher Secondary School"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="guardianName"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Parent / Guardian Name *
                </label>
                <input
                  id="guardianName"
                  name="guardianName"
                  required
                  value={formData.guardianName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Father/Mother/Guardian"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Contact Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Residential Address *
              </label>
              <input
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Village / Town, District, Tripura"
              />
            </div>

            <div>
              <label
                htmlFor="booksNeeded"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Required Subjects / Books List *
              </label>
              <textarea
                id="booksNeeded"
                name="booksNeeded"
                required
                rows={3}
                value={formData.booksNeeded}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Mathematics, Physical Science, English Grammar, Bengali literature textbooks..."
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Additional Family / Economic Background (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Any additional details to assist our team in assessing scholarship or stationery assistance..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting Application..." : "Submit Book Distribution Application →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
