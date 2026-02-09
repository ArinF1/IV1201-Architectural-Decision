import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ApplicationSubmission from './pages/ApplicationSubmission';
import ApplicationList from './pages/ApplicationList';
import Registration from './pages/Registration';
import Login from './pages/Login';
import LanguageSelector from './components/LanguageSelector';

function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">{t('nav.title')}</h1>
          <div className="flex items-center gap-8">
            <ul className="flex gap-8 list-none">
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
            </ul>
            <LanguageSelector />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-8">
        <Routes>
          <Route path="/" element={<ApplicationSubmission />} />
          <Route path="/applications" element={<ApplicationList />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
