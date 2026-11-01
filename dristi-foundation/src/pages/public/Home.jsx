import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ORG } from "../../config/orgInfo";
import { getUpdatePosts, getWorkPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loader from "../../components/Loader";

export default function Home() {
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [recentWork, setRecentWork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getUpdatePosts().then((posts) => setRecentUpdates(posts.slice(0, 3))),
      getWorkPosts().then((posts) => setRecentWork(posts.slice(0, 3))),
    ])
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-white/10 border border-white/20 mb-4">
              Registered NGO • {ORG.address}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              {ORG.name}
            </h1>
            <p className="text-base md:text-xl text-indigo-100 mb-8 leading-relaxed">
              {ORG.tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/events"
                className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-50 shadow-md transition-all"
              >
                👤 Citizen Portal — View Camps
              </Link>
              <Link
                to="/our-work"
                className="px-6 py-3 border border-white/40 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all"
              >
                Explore Our Work →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Quick Services Banner */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/events"
              className="p-4 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                👁️
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Free Eye Camp Registration</p>
                <p className="text-[11px] text-gray-500">Book your checkup slot</p>
              </div>
            </Link>

            <Link
              to="/events"
              className="p-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                📚
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Free Books Application</p>
                <p className="text-[11px] text-gray-500">Class 1-12 & competitive exams</p>
              </div>
            </Link>

            <Link
              to="/my-applications"
              className="p-4 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50/40 transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                📋
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Track My Applications</p>
                <p className="text-[11px] text-gray-500">Check approval status live</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-16 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Core Pillars
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
              What We Do
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ORG.works.map((work) => (
              <div
                key={work.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-lg transition-all"
              >
                <div className="text-5xl mb-4">{work.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {work.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {work.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Updates Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Announcements
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
                Recent Updates & Notices
              </h2>
            </div>
            <Link
              to="/updates"
              className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All Updates →
            </Link>
          </div>

          {error ? (
            <p role="alert" className="text-center text-red-700 py-8 text-xs">
              Unable to load updates: {error}
            </p>
          ) : loading ? (
            <Loader />
          ) : recentUpdates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-4xl mb-2 block">📢</span>
              <p className="text-xs text-gray-500">No public notices at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentUpdates.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Our Work Showcase */}
      {recentWork.length > 0 && (
        <section className="py-16 bg-gray-50/60 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Field Gallery
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
                  Our Work in Action
                </h2>
              </div>
              <Link
                to="/our-work"
                className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
              >
                View All Work Stories →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentWork.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Citizen CTA */}
      <section className="bg-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-3">Join Our Mission</h2>
          <p className="text-indigo-100 mb-8 text-xs sm:text-sm max-w-xl mx-auto">
            Together we can bring light to more lives. Sign up as a citizen to participate in our
            eye checkup camps, request free educational books, or volunteer with us.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-white text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-50 shadow-md transition-all"
          >
            Create Citizen Account Today
          </Link>
        </div>
      </section>
    </div>
  );
}
