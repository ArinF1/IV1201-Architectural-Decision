import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await applicationAPI.loginUser(formData);
      login(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      if (response.data.role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(t('login.errorMessage') + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-semibold mb-8 text-slate-800">{t('login.title')}</h2>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <span className="text-xl">{t('common.error')}</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.username')}</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.password')}</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? t('login.loggingIn') : t('login.login')}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          {t('login.noAccount')}{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            {t('login.registerHere')}
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
