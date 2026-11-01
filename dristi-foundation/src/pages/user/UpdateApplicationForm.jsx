import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getApplicationCategoryLabel, applicationTemplates } from "../../config/applicationForms";
import { getPost } from "../../services/postService";
import { createRegistration } from "../../services/registrationService";
import Loader from "../../components/Loader";

const fieldClassName =
  "w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none";

export default function UpdateApplicationForm() {
  const { postId } = useParams();
  const { user, profile } = useAuth();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({});
  const [loadingPost, setLoadingPost] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fields = useMemo(() => {
    if (!post) return [];
    const template = applicationTemplates[post.application_category] || applicationTemplates.general;
    const customFields = Array.isArray(post.application_fields) ? post.application_fields : [];
    return [...template, ...customFields];
  }, [post]);

  useEffect(() => {
    let active = true;
    getPost(postId)
      .then((loadedPost) => {
        if (!active) return;
        if (loadedPost.type !== "update" || !loadedPost.application_enabled) {
          setError("Applications are not open for this update.");
          return;
        }
        setPost(loadedPost);
        const defaults = {};
        const configuredFields = [
          ...(applicationTemplates[loadedPost.application_category] || applicationTemplates.general),
          ...(Array.isArray(loadedPost.application_fields) ? loadedPost.application_fields : []),
        ];
        for (const field of configuredFields) {
          defaults[field.name] =
            field.name === "phone"
              ? profile?.phone || ""
              : field.name === "address"
                ? profile?.address || ""
                : field.name === "guardianName" || field.name === "applicantName"
                  ? profile?.full_name || ""
                  : "";
        }
        setFormData(defaults);
      })
      .catch((loadError) => {
        if (active) setError(`Unable to load this application: ${loadError.message}`);
      })
      .finally(() => {
        if (active) setLoadingPost(false);
      });

    return () => {
      active = false;
    };
  }, [postId, profile]);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createRegistration({
        user_id: user.id,
        event_id: null,
        post_id: post.id,
        details: formData,
      });
      setSuccess(true);
    } catch (submitError) {
      setError(submitError.message || "Unable to submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPost) return <Loader />;

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            ✅
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Application Received
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">Application submitted</h1>
          <p className="text-sm text-gray-600 mb-6">
            Your application for <strong>{post.title}</strong> has been received.
          </p>
          <Link
            to="/my-applications"
            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold"
          >
            View My Applications →
          </Link>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
        <p role="alert" className="text-red-700 mb-4">{error}</p>
        <Link to="/updates" className="text-indigo-700 font-semibold">Back to Updates</Link>
      </div>
    );
  }

  const categoryLabel = getApplicationCategoryLabel(
    post.application_category,
    post.application_category_label,
  );

  return (
    <div className="min-h-screen bg-gray-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/updates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 mb-6"
        >
          ← Back to Updates
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {categoryLabel} Application
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{post.title}</h1>
          {post.content && <p className="text-sm text-gray-600 mt-2 mb-6">{post.content}</p>}

          {error && (
            <p role="alert" className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  {field.label} {field.required && "*"}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    rows={3}
                    className={fieldClassName}
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={["number", "tel", "date"].includes(field.type) ? field.type : "text"}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    className={fieldClassName}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold"
            >
              {submitting ? "Submitting..." : "Submit Application →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
