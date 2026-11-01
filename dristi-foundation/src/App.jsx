import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

// Public pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import OurWork from "./pages/public/OurWork";
import Updates from "./pages/public/Updates";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// User pages
import Events from "./pages/user/Events";
import EyeCampForm from "./pages/user/EyeCampForm";
import BookApplyForm from "./pages/user/BookApplyForm";
import UpdateApplicationForm from "./pages/user/UpdateApplicationForm";
import MyApplications from "./pages/user/MyApplications";
import AccountSecurity from "./pages/user/AccountSecurity";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import ManagePosts from "./pages/admin/ManagePosts";
import ManageEvents from "./pages/admin/ManageEvents";
import Registrations from "./pages/admin/Registrations";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <span className="text-4xl">⚠️</span>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Something went wrong</h2>
            <p className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg text-left overflow-auto max-h-32">
              {this.state.error?.message || "An unexpected error occurred while loading this page."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { authError } = useAuth();

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        {authError && (
          <p role="alert" className="bg-red-50 px-4 py-3 text-center text-red-700 text-xs">
            {authError}
          </p>
        )}
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-work" element={<OurWork />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Login adminOnly />} />
            <Route path="/signup" element={<Signup />} />

            {/* Logged-in users */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register/eye-camp/:eventId?"
              element={
                <ProtectedRoute>
                  <EyeCampForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-appointment/:eventId?"
              element={
                <ProtectedRoute>
                  <EyeCampForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply/books/:eventId?"
              element={
                <ProtectedRoute>
                  <BookApplyForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply/post/:postId"
              element={
                <ProtectedRoute>
                  <UpdateApplicationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/security"
              element={
                <ProtectedRoute>
                  <AccountSecurity />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <AdminRoute>
                  <ManagePosts />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <AdminRoute>
                  <ManageEvents />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/registrations"
              element={
                <AdminRoute>
                  <Registrations />
                </AdminRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
