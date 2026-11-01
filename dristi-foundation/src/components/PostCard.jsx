import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApplicationCategoryLabel } from "../config/applicationForms";

const categoryLabels = {
  eye_camp: { icon: "👁️", color: "bg-blue-50 text-blue-700 border-blue-200" },
  book_distribution: { icon: "📚", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  flood_relief: { icon: "🌊", color: "bg-amber-50 text-amber-700 border-amber-200" },
  general: { icon: "🤝", color: "bg-purple-50 text-purple-700 border-purple-200" },
  custom: { icon: "✨", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const date = new Date(post.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const isWork = post.type === "our_work";
  const category = post.application_category || post.work_category;
  const cat = categoryLabels[category] || categoryLabels.general;
  const categoryLabel = getApplicationCategoryLabel(
    category,
    post.application_category_label,
  );
  const canRegister = !isWork && post.application_enabled;
  const targetUrl = `/apply/post/${post.id}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full group">
      {post.image_url ? (
        <div className="relative overflow-hidden aspect-video bg-gray-100">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                isWork
                  ? "bg-emerald-900/80 text-emerald-200 border-emerald-400/30"
                  : "bg-indigo-900/80 text-indigo-200 border-indigo-400/30"
              }`}
            >
              {isWork ? "🌟 Field Work" : "📢 Notice"}
            </span>

            {((isWork && post.work_category) || canRegister) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-gray-800 backdrop-blur-md shadow-sm">
                {cat.icon} {categoryLabel}
              </span>
            )}

            {canRegister && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white backdrop-blur-md shadow-sm animate-pulse">
                ● Registration Open
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                isWork
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
              }`}
            >
              {isWork ? "🌟 Field Work" : "📢 Notice"}
            </span>

            {((isWork && post.work_category) || canRegister) && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cat.color}`}>
                {cat.icon} {categoryLabel}
              </span>
            )}
          </div>

          {canRegister && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              ● Registration Open
            </span>
          )}
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
          <span>📅</span>
          <span>{date}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
          {post.title}
        </h3>

        <p
          className={`text-gray-600 text-xs sm:text-sm leading-relaxed flex-1 ${
            expanded ? "" : "line-clamp-4"
          }`}
        >
          {post.content}
        </p>

        {post.content && post.content.length > 180 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start focus:outline-none"
          >
            {expanded ? "Show less ↑" : "Read full notice →"}
          </button>
        )}

        {/* Action Button: Book Appointment / Register */}
        {canRegister && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            {user ? (
              <Link
                to={targetUrl}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Apply for {categoryLabel} →</span>
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: { pathname: targetUrl } }}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold text-center shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>👤 Login to Apply →</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
