import { useEffect, useState } from "react";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  uploadPostImage,
} from "../../services/postService";
import {
  applicationCategories,
  getApplicationCategoryLabel,
} from "../../config/applicationForms";
import Loader from "../../components/Loader";

const workCategories = [
  { value: "eye_camp", label: "👁️ Eye Checkup Camps" },
  { value: "book_distribution", label: "📚 Book Distribution" },
  { value: "flood_relief", label: "🌊 Flood Relief" },
  { value: "general", label: "🤝 General / Community Outreach" },
  { value: "custom", label: "✨ Other / Custom" },
];

const createInitialFormData = () => ({
  title: "",
  content: "",
  image_url: "",
  type: "update",
  work_category: "eye_camp",
  application_enabled: false,
  application_category: "eye_camp",
  application_category_label: "",
  application_fields: [],
});

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'update' | 'our_work'

  const [formData, setFormData] = useState(createInitialFormData);
  const [imageFile, setImageFile] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getPosts();
      setPosts(data || []);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const resetForm = () => {
    setFormData(createInitialFormData());
    setImageFile(null);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      content: post.content || "",
      image_url: post.image_url || "",
      type: post.type || "update",
      work_category: post.work_category || "eye_camp",
      application_enabled: post.application_enabled || false,
      application_category: post.application_category || post.work_category || "eye_camp",
      application_category_label: post.application_category_label || "",
      application_fields: post.application_fields || [],
    });
    setEditing(post.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(id);
      await loadPosts();
    } catch (error) {
      alert(`Failed to delete post: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        imageUrl = await uploadPostImage(imageFile);
      }

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        image_url: imageUrl,
        type: formData.type,
        work_category: formData.type === "our_work" ? formData.work_category : "general",
        application_enabled: formData.type === "update" && formData.application_enabled,
        application_category:
          formData.type === "update" && formData.application_enabled
            ? formData.application_category
            : null,
        application_category_label:
          formData.type === "update" &&
          formData.application_enabled &&
          formData.application_category === "custom"
            ? formData.application_category_label.trim()
            : null,
        application_fields:
          formData.type === "update" && formData.application_enabled
            ? formData.application_fields.filter((field) => field.label.trim())
            : [],
      };

      if (editing) {
        await updatePost(editing, postData);
      } else {
        await createPost(postData);
      }
      resetForm();
      await loadPosts();
    } catch (error) {
      alert(`Failed to save post: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts =
    activeTab === "all"
      ? posts
      : posts.filter((p) => (p.type || "update") === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Posts & Content</h1>
            <p className="mt-1 text-sm text-gray-500">
              Publish announcements in <strong>Updates</strong> or showcase field stories in{" "}
              <strong>Our Work</strong>.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="self-start sm:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <span>+</span> Create New Post
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            All Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("update")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "update"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>📢</span>
            <span>
              Public Updates ({posts.filter((p) => (p.type || "update") === "update").length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("our_work")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "our_work"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>🌟</span>
            <span>
              Our Work Stories ({posts.filter((p) => p.type === "our_work").length})
            </span>
          </button>
        </div>

        {/* Form Modal / Card */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? "Edit Post" : "Create New Post"}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Post Type Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                  Select Post Type & Destination *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.type === "update"
                        ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="postType"
                      value="update"
                      checked={formData.type === "update"}
                      onChange={() => setFormData({ ...formData, type: "update" })}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <span>📢</span> Public Update / Notice
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Will appear on the <strong>Updates</strong> page and recent home notices.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.type === "our_work"
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-200"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="postType"
                      value="our_work"
                      checked={formData.type === "our_work"}
                      onChange={() => setFormData({ ...formData, type: "our_work" })}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <span>🌟</span> Our Work / Field Story
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Will appear on the <strong>Our Work / Gallery</strong> showcase page.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Work Category (Visible only when type === 'our_work') */}
              {formData.type === "our_work" && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <label
                    htmlFor="work_category"
                    className="block text-xs font-semibold uppercase tracking-wider text-emerald-900 mb-1.5"
                  >
                    Work Category / Initiative *
                  </label>
                  <select
                    id="work_category"
                    value={formData.work_category}
                    onChange={(e) =>
                      setFormData({ ...formData, work_category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {workCategories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type === "update" && (
                <section className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.application_enabled}
                      onChange={(e) =>
                        setFormData({ ...formData, application_enabled: e.target.checked })
                      }
                      className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      <span className="block text-sm font-bold text-gray-900">
                        Accept citizen applications for this update
                      </span>
                      <span className="block text-xs text-gray-600 mt-0.5">
                        The update will show an application button and collect responses in the admin portal.
                      </span>
                    </span>
                  </label>

                  {formData.application_enabled && (
                    <>
                      <div>
                        <label
                          htmlFor="application_category"
                          className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
                        >
                          Application Type *
                        </label>
                        <select
                          id="application_category"
                          value={formData.application_category}
                          onChange={(e) =>
                            setFormData({ ...formData, application_category: e.target.value })
                          }
                          className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {applicationCategories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.application_category === "custom" && (
                        <div>
                          <label
                            htmlFor="application_category_label"
                            className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
                          >
                            Custom Application Type *
                          </label>
                          <input
                            id="application_category_label"
                            required
                            value={formData.application_category_label}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                application_category_label: e.target.value,
                              })
                            }
                            placeholder="e.g. Community Health Screening"
                            className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                        </div>
                      )}

                      <div className="border-t border-indigo-200 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">
                              Extra application questions
                            </h3>
                            <p className="text-xs text-gray-600">
                              The selected type includes standard questions. Add any update-specific questions here.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                application_fields: [
                                  ...formData.application_fields,
                                  {
                                    name: `custom_${Date.now()}`,
                                    label: "",
                                    type: "text",
                                    required: false,
                                  },
                                ],
                              })
                            }
                            className="self-start px-3 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-50"
                          >
                            + Add Question
                          </button>
                        </div>

                        {formData.application_fields.map((field, index) => (
                          <div
                            key={field.name}
                            className="grid grid-cols-1 sm:grid-cols-[1fr_150px_auto_auto] items-end gap-3 p-3 mb-2 bg-white rounded-xl border border-indigo-100"
                          >
                            <div>
                              <label
                                htmlFor={`application-field-${field.name}`}
                                className="block text-xs font-medium text-gray-700 mb-1"
                              >
                                Question label *
                              </label>
                              <input
                                id={`application-field-${field.name}`}
                                required
                                value={field.label}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    application_fields: formData.application_fields.map((item, i) =>
                                      i === index ? { ...item, label: e.target.value } : item,
                                    ),
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="e.g. Number of children in family"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`application-field-type-${field.name}`}
                                className="block text-xs font-medium text-gray-700 mb-1"
                              >
                                Answer type
                              </label>
                              <select
                                id={`application-field-type-${field.name}`}
                                value={field.type}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    application_fields: formData.application_fields.map((item, i) =>
                                      i === index ? { ...item, type: e.target.value } : item,
                                    ),
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="text">Short text</option>
                                <option value="number">Number</option>
                                <option value="tel">Phone</option>
                                <option value="date">Date</option>
                                <option value="textarea">Long text</option>
                              </select>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-gray-700 pb-2">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    application_fields: formData.application_fields.map((item, i) =>
                                      i === index ? { ...item, required: e.target.checked } : item,
                                    ),
                                  })
                                }
                                className="rounded text-indigo-600"
                              />
                              Required
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  application_fields: formData.application_fields.filter(
                                    (_, i) => i !== index,
                                  ),
                                })
                              }
                              className="pb-2 text-xs font-semibold text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}

              <div>
                <label
                  htmlFor="title"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Post Title *
                </label>
                <input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Free Eye Checkup Camp held in Kumarghat"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Description / Story Content *
                </label>
                <textarea
                  id="content"
                  rows={5}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Share details of the event, beneficiaries supported, spectacles distributed, or community notice..."
                />
              </div>

              <div>
                <label
                  htmlFor="image"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Featured Photo
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                {formData.image_url && !imageFile && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <span className="text-xs text-gray-500">Current attached image</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {submitting
                    ? "Publishing..."
                    : editing
                    ? "Update Post"
                    : "Publish Post →"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Load Error */}
        {loadError && (
          <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
            Unable to load posts: {loadError}
          </p>
        )}

        {/* Posts List */}
        {loading ? (
          <Loader />
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <span className="text-5xl mb-3 block">📝</span>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {activeTab === "all"
                ? "No posts yet"
                : activeTab === "update"
                ? "No public updates found"
                : "No our work stories found"}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
              Click the button above to publish your first post to either the Updates or Our
              Work section.
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              + Create Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPosts.map((post) => {
              const isWork = post.type === "our_work";
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt=""
                      className="w-full sm:w-28 h-28 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="w-full sm:w-28 h-28 rounded-xl bg-gray-50 flex items-center justify-center text-3xl flex-shrink-0 text-gray-400 border border-dashed border-gray-200">
                      {isWork ? "🌟" : "📢"}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isWork
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {isWork ? "🌟 Our Work" : "📢 Public Update"}
                      </span>

                      {isWork && post.work_category && (
                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {workCategories.find((c) => c.value === post.work_category)?.label ||
                            post.work_category}
                        </span>
                      )}

                      {!isWork && post.application_enabled && (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Applications open ·{" "}
                          {getApplicationCategoryLabel(
                            post.application_category,
                            post.application_category_label,
                          )}
                        </span>
                      )}

                      <span className="text-[11px] text-gray-400">
                        {new Date(post.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      onClick={() => handleEdit(post)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-indigo-50 text-indigo-600 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold bg-gray-50 hover:bg-red-50 text-red-600 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
