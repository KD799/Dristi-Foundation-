import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createRegistration } from "../../services/registrationService";
import { getEvent, getOpenEvents, createEvent } from "../../services/eventService";
import Loader from "../../components/Loader";

export default function EyeCampForm() {
  const { eventId: paramEventId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const queryEventId = searchParams.get("eventId");
  const initialEventId = paramEventId || queryEventId || "";

  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [eventData, setEventData] = useState(null);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    visionIssue: "",
    previousCheckup: "no",
    spectaclesNeeded: "yes",
    notes: "",
  });

  // Load event details or list of available eye camps
  useEffect(() => {
    async function loadEventInfo() {
      setFetchingEvent(true);
      try {
        const events = await getOpenEvents();
        const eyeCamps = (events || []).filter(
          (e) => e.type === "eye_camp" || e.title.toLowerCase().includes("eye")
        );
        setAvailableEvents(eyeCamps);

        const targetId = initialEventId || (eyeCamps.length > 0 ? eyeCamps[0].id : "");

        if (targetId) {
          setSelectedEventId(targetId);
          const current = await getEvent(targetId);
          setEventData(current);
        } else if (events && events.length > 0) {
          // If no eye_camp explicitly, use first open event
          setSelectedEventId(events[0].id);
          setEventData(events[0]);
        }
      } catch (e) {
        console.warn("Could not load events:", e.message);
      } finally {
        setFetchingEvent(false);
      }
    }

    loadEventInfo();
  }, [initialEventId]);

  // When selected event changes from dropdown
  const handleEventSelection = async (id) => {
    setSelectedEventId(id);
    const found = availableEvents.find((e) => e.id === id);
    if (found) {
      setEventData(found);
    } else if (id) {
      try {
        const data = await getEvent(id);
        setEventData(data);
      } catch (err) {
        console.warn("Failed to fetch selected event:", err);
      }
    }
  };

  // Pre-fill profile info if available
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        patientName: prev.patientName || profile.full_name || "",
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
      let finalEventId = selectedEventId;

      // If for any reason no event exists in DB, ensure one so RLS passes
      if (!finalEventId) {
        const fallback = await createEvent({
          title: "Free Eye Checkup & Spectacles Camp",
          type: "eye_camp",
          description: "Regular eye checkup and vision correction program",
          location: "Kumarghat, Tripura",
          registration_open: true,
        });
        finalEventId = fallback.id;
        setSelectedEventId(finalEventId);
      }

      await createRegistration({
        user_id: user.id,
        event_id: finalEventId,
        details: formData,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEvent) {
    return <Loader />;
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            ✅
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Citizen Appointment Booked
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-2">
            Appointment Booked Successfully!
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed mb-6">
            Your appointment for{" "}
            <strong>{eventData?.title || "Free Eye Checkup Camp"}</strong> has been confirmed.
            Please visit the venue on the scheduled date with photo ID.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/my-applications")}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all"
            >
              View My Appointments & Slip →
            </button>
            <Link
              to="/updates"
              className="block w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-all text-center"
            >
              Back to Updates & Notices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back navigation */}
        <Link
          to="/updates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <span>←</span> Back to Updates & Events
        </Link>

        {/* Camp Details Header Card */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white p-6 sm:p-7 rounded-2xl shadow-sm mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
              👁️ Eye Checkup Appointment
            </span>
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Free Service
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mt-1 mb-2">
            {eventData?.title || "Free Eye Checkup & Spectacles Camp"}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100 mt-2">
            <span>
              📅 Date:{" "}
              <strong>
                {eventData?.event_date
                  ? new Date(eventData.event_date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Daily / Announced Camp Dates"}
              </strong>
            </span>
            <span>
              📍 Venue:{" "}
              <strong>{eventData?.location || "143 Pura, Kumarghat, Tripura"}</strong>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Book Your Eye Checkup Appointment
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Fill in patient details below. All consultations and spectacles provided by Dristi
              Foundation are completely free of charge.
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
            {/* Camp Selector if multiple are open */}
            {availableEvents.length > 1 && (
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                <label
                  htmlFor="campSelector"
                  className="block text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1.5"
                >
                  Select Camp Location *
                </label>
                <select
                  id="campSelector"
                  value={selectedEventId}
                  onChange={(e) => handleEventSelection(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {availableEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} — {evt.location || "Kumarghat"} (
                      {evt.event_date
                        ? new Date(evt.event_date).toLocaleDateString("en-IN")
                        : "Upcoming"}
                      )
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="patientName"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Patient Full Name *
                </label>
                <input
                  id="patientName"
                  name="patientName"
                  required
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Full name as per Aadhaar"
                />
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Age (Years) *
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 45"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="gender"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Village / Town / Residential Address *
              </label>
              <input
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Village / Ward No., Kumarghat, Tripura"
              />
            </div>

            <div>
              <label
                htmlFor="visionIssue"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Vision Issue / Complaint *
              </label>
              <textarea
                id="visionIssue"
                name="visionIssue"
                required
                rows={3}
                value={formData.visionIssue}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Describe your vision difficulty (e.g., blurry vision, headache while reading, watering eyes, previous cataract surgery...)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="previousCheckup"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Previous Eye Checkup?
                </label>
                <select
                  id="previousCheckup"
                  name="previousCheckup"
                  value={formData.previousCheckup}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="no">No (First time checkup)</option>
                  <option value="yes">Yes (Underwent checkup before)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="spectaclesNeeded"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Requires Free Spectacles?
                </label>
                <select
                  id="spectaclesNeeded"
                  name="spectaclesNeeded"
                  value={formData.spectaclesNeeded}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="yes">Yes (Need reading / distance glasses)</option>
                  <option value="no">No (Eye checkup only)</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Special Assistance / Medical Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Senior citizen, diabetic, wheelchair assistance required..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting Appointment..." : "Confirm & Book Eye Appointment →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
