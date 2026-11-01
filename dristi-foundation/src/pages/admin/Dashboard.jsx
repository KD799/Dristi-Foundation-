import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import Loader from "../../components/Loader";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const [postsRes, eventsRes, regsRes, pendingRes] = await Promise.all([
          supabase.from("posts").select("id", { count: "exact", head: true }),
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("registrations").select("id", { count: "exact", head: true }),
          supabase
            .from("registrations")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);
        const responseError = [postsRes, eventsRes, regsRes, pendingRes].find(
          (response) => response.error,
        )?.error;
        if (responseError) throw responseError;

        setStats({
          posts: postsRes.count ?? 0,
          events: eventsRes.count ?? 0,
          registrations: regsRes.count ?? 0,
          pending: pendingRes.count ?? 0,
        });
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <Loader />;

  const cards = [
    {
      title: "Total Posts",
      value: stats?.posts ?? 0,
      icon: "📝",
      link: "/admin/posts",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Events",
      value: stats?.events ?? 0,
      icon: "📅",
      link: "/admin/events",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Total Registrations",
      value: stats?.registrations ?? 0,
      icon: "📋",
      link: "/admin/registrations",
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Pending Approvals",
      value: stats?.pending ?? 0,
      icon: "⏳",
      link: "/admin/registrations",
      color: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {error && (
          <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            Unable to load dashboard statistics: {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{card.icon}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${card.color}`}
                >
                  View
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.title}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/posts"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-medium text-gray-900">Manage Posts</p>
                <p className="text-sm text-gray-500">Create or edit updates</p>
              </div>
            </Link>
            <Link
              to="/admin/events"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-medium text-gray-900">Manage Events</p>
                <p className="text-sm text-gray-500">Create or edit events</p>
              </div>
            </Link>
            <Link
              to="/admin/registrations"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-gray-900">Registrations</p>
                <p className="text-sm text-gray-500">Review applications</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
