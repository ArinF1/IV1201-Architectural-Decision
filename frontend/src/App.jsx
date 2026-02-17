import { useEffect } from 'react';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';
import ApplicationSubmission from './pages/ApplicationSubmission';
import ApplicationList from './pages/ApplicationList';
import Registration from './pages/Registration';
import Login from './pages/Login';
import LanguageSelector from './components/LanguageSelector';
import ProtectedRoute from './components/ProtectedRoute';
import RecruiterDashboard from './pages/RecruiterDashboard';

function RoleBasedRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.pathname === "/") {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role === "recruiter") {
        navigate("/applications", { replace: true });
      }
    }
  }, [location, navigate]);
  return null;
}


function App() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <RoleBasedRedirect />
      <nav className="bg-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{t('nav.title')}</h1>
          <div className="flex items-center gap-8">
            <ul className="flex gap-8 list-none items-center">
              {isAuthenticated && user?.role !== "recruiter" && (
                <li>
                  <Link
                    to="/"
                    className="bg-slate-700 text-white no-underline px-4 py-2 rounded transition-colors hover:bg-slate-600 shadow"
                  >
                    {t('nav.submitApplication')}
                  </Link>
                </li>
              )}
              {isAuthenticated && user?.role === "recruiter" && (
                <li>
                  <Link
                    to="/applications"
                    className="bg-slate-700 text-white no-underline px-4 py-2 rounded transition-colors hover:bg-slate-600 shadow"
                  >
                    {t('nav.viewApplications')}
                  </Link>
                </li>
              )}
              {isAuthenticated && (
                <li>
                  <button
                    onClick={logout}
                    className="bg-slate-700 text-white no-underline px-4 py-2 rounded transition-colors hover:bg-slate-600 shadow"
                  >
                    {t('nav.logout')}
                  </button>
                </li>
              )}
              {!isAuthenticated && (
                <li>
                  <Link
                    to="/login"
                    className="bg-slate-700 text-white no-underline px-4 py-2 rounded transition-colors hover:bg-slate-600 shadow"
                  >
                    {t('nav.login')}
                  </Link>
                </li>
              )}
            </ul>
            <LanguageSelector />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-8">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === "recruiter" ? <Navigate to="/applications" replace /> : <ApplicationSubmission />}
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute>
              {user?.role !== "recruiter" ? <Navigate to="/" replace /> : <ApplicationList />}
            </ProtectedRoute>
          } />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recruiter" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
