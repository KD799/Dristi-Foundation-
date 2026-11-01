import { useEffect, useState } from "react";
import { getOpenEvents } from "../../services/eventService";
import EventCard from "../../components/EventCard";
import Loader from "../../components/Loader";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getOpenEvents()
      .then(setEvents)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? events : events.filter((e) => e.type === filter);

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-indigo-100 text-lg">
            Register for upcoming camps and programs.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { value: "all", label: "All" },
              { value: "eye_camp", label: "👁️ Eye Camps" },
              { value: "book_distribution", label: "📚 Books" },
              { value: "flood_relief", label: "🌊 Flood Relief" },
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

          {error ? (
            <p role="alert" className="text-center text-red-700 py-8">
              Unable to load events: {error}
            </p>
          ) : loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📅</p>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Events Found
              </h3>
              <p className="text-gray-500">
                {filter === "all"
                  ? "No upcoming events at this time. Check back soon!"
                  : "No events of this type are available right now."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
