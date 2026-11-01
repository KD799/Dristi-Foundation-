import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ORG } from "../../config/orgInfo";
import { getWorkPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loader from "../../components/Loader";

export default function OurWork() {
  const [workPosts, setWorkPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getWorkPosts()
      .then(setWorkPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts =
    filter === "all"
      ? workPosts
      : workPosts.filter((p) => (p.work_category || "general") === filter);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-emerald-800 via-teal-700 to-indigo-800 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-white/10 border border-white/20 mb-3">
            🌟 Community Impact & Field Missions
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Our Work in Tripura
          </h1>
          <p className="text-emerald-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            From conducting remote eye checkup camps to empowering students with textbooks and
            delivering emergency flood relief, explore how {ORG.name} serves communities across
            Tripura.
          </p>
        </div>
      </section>

      {/* Core Pillars Overview */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">Key Focus Areas</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Dedicated humanitarian and educational programs run year-round
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mb-4">
                👁️
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Eye Checkup Camps</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Free comprehensive vision screening, spectacles distribution, and cataract
                referrals in underserved rural areas.
              </p>
              <Link
                to="/events"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                View Eye Camps →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mb-4">
                📚
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Free Book Distribution</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Providing standard school textbooks, stationery, and competitive exam materials to
                students from economically weaker backgrounds.
              </p>
              <Link
                to="/events"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                Apply for Books →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mb-4">
                🌊
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Flood & Disaster Relief</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                Rapid emergency mobilization, food, clean drinking water, and rehabilitation
                support for families affected by monsoon floods in Tripura.
              </p>
              <Link
                to="/events"
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
              >
                Check Relief Drives →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Field Stories / Work Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Ground Reality & Photos
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
                Field Reports & Showcase
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Real photos and reports from our recent camps and distribution drives.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All Work" },
                { value: "eye_camp", label: "👁️ Eye Camps" },
                { value: "book_distribution", label: "📚 Books" },
                { value: "flood_relief", label: "🌊 Flood Relief" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filter === t.value
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-center text-red-700 py-8 text-xs">
              Unable to load field reports: {error}
            </p>
          ) : loading ? (
            <Loader />
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto">
              <span className="text-5xl mb-3 block">📷</span>
              <h3 className="text-base font-bold text-gray-900 mb-1">No Work Stories Found</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                {filter === "all"
                  ? "Field reports and camp photos will appear here once published by the foundation."
                  : "No stories under this category yet. Switch filter to view all work."}
              </p>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
                >
                  Show All Work
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Citizen CTA Banner */}
      <section className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Need Free Eye Care or Textbooks?
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm max-w-xl mx-auto mb-6">
            Register through our Citizen Portal to apply for free spectacles, eye checkup slots,
            or textbooks for the upcoming academic session.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/events"
              className="px-6 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs hover:bg-indigo-50 shadow-md transition-all"
            >
              Browse Upcoming Camps →
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 rounded-xl border border-white/40 text-white font-bold text-xs hover:bg-white/10 transition-all"
            >
              Register Citizen Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
