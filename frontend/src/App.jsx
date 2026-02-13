import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
  React.useEffect(() => {
    if (location.pathname === "/") {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role === "recruiter") {
        navigate("/recruiter", { replace: true });
      }
    }
  }, [location, navigate]);
  return null;
}

function App() {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <RoleBasedRedirect />
      <nav className="bg-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{t('nav.title')}</h1>
          <div className="flex items-center gap-8">
            <ul className="flex gap-8 list-none">
              {isAuthenticated && (
                <>
                  <li>
                    <Link
                      to="/"
                      className="text-white no-underline px-4 py-2 rounded hover:bg-slate-700 transition-colors"
                    >
                      {t('nav.submitApplication')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/applications"
                      className="text-white no-underline px-4 py-2 rounded hover:bg-slate-700 transition-colors"
                    >
                      {t('nav.viewApplications')}
                    </Link>
                  </li>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <li>
                    <Link
                      to="/register"
                      className="text-white no-underline px-4 py-2 rounded hover:bg-slate-700 transition-colors"
                    >
                      {t('nav.register')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="text-white no-underline px-4 py-2 rounded hover:bg-slate-700 transition-colors"
                    >
                      {t('nav.login')}
                    </Link>
                  </li>
                </>
              )}
              {isAuthenticated && (
                <li>
                  <button
                    onClick={logout}
                    className="text-white no-underline px-4 py-2 rounded hover:bg-slate-700 transition-colors bg-transparent border-none cursor-pointer text-base"
                  >
                    {t('nav.logout')}
                  </button>
                </li>
              )}
            </ul>
            <LanguageSelector />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-8">
        <Routes>
          <Route path="/" element={<ProtectedRoute><ApplicationSubmission /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><ApplicationList /></ProtectedRoute>} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recruiter" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
