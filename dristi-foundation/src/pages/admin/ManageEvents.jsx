import { useEffect, useState } from "react";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../services/eventService";
import Loader from "../../components/Loader";

const eventTypes = [
  { value: "eye_camp", label: "Eye Camp" },
  { value: "book_distribution", label: "Book Distribution" },
  { value: "flood_relief", label: "Flood Relief" },
  { value: "other", label: "Other" },
];

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    type: "eye_camp",
    description: "",
    event_date: "",
    location: "",
    registration_open: true,
  });

  const loadEvents = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      type: "eye_camp",
      description: "",
      event_date: "",
      location: "",
      registration_open: true,
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      type: event.type || "other",
      description: event.description || "",
      event_date: event.event_date || "",
      location: event.location || "",
      registration_open: event.registration_open,
    });
    setEditing(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      await loadEvents();
    } catch (error) {
      alert(`Failed to delete event: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await updateEvent(editing, formData);
      } else {
        await createEvent(formData);
      }
      resetForm();
      await loadEvents();
    } catch (error) {
      alert(`Failed to save event: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            + New Event
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editing ? "Edit Event" : "Create New Event"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    id="eventTitle"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    id="eventType"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    {eventTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="eventDesc" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="eventDesc"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Describe the event..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date
                  </label>
                  <input
                    id="eventDate"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    id="eventLocation"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Event location"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="regOpen"
                  type="checkbox"
                  checked={formData.registration_open}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_open: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="regOpen" className="text-sm text-gray-700">
                  Registration Open
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {submitting
                    ? "Saving..."
                    : editing
                    ? "Update Event"
                    : "Create Event"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loadError && (
          <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            Unable to load events: {loadError}
          </p>
        )}

        {loading ? (
          <Loader />
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-5xl mb-4">📅</p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Events
            </h3>
            <p className="text-gray-500">Create your first event to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {event.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        event.registration_open
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {event.registration_open ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {event.type?.replace("_", " ")} •{" "}
                    {event.event_date
                      ? new Date(event.event_date).toLocaleDateString("en-IN")
                      : "No date"}{" "}
                    • {event.location || "No location"}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(event)}
                    className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
