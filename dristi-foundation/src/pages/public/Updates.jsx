import { useEffect, useState } from "react";
import { getUpdatePosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loader from "../../components/Loader";

export default function Updates() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUpdatePosts()
      .then(setPosts)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider bg-white/10 border border-white/20 mb-3">
            📢 Official Announcements & News
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Latest Updates & Notices
          </h1>
          <p className="text-indigo-100 text-sm md:text-base max-w-2xl mx-auto">
            Stay informed about our upcoming camps, scholarship distribution dates, flood relief
            efforts, and community notices.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <p role="alert" className="text-center text-red-700 py-8 text-sm">
              Unable to load updates: {error}
            </p>
          ) : loading ? (
            <Loader />
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto">
              <span className="text-5xl mb-4 block">📰</span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No Updates Published Yet
              </h3>
              <p className="text-xs text-gray-500">
                Check back soon! Recent updates and announcements from Dristi Foundation will be
                posted here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
