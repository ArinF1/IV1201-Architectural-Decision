import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { applicationAPI } from '../services/api';

/**
 * Recruiter view. Displays a paginated, filterable list of applications.
 * @returns {JSX.Element}
 */
function ApplicationList() {
  const { t } = useTranslation();

  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sortBy, setSortBy] = useState('name'); // date removed (no createdAt)
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchApplications(1);
  }, []);

  async function fetchApplications(targetPage = page) {
    setLoading(true);
    setError('');
    try {
      const response = await applicationAPI.getApplications(targetPage, 10, true);

      const payload = response?.data?.data;
      const apps = payload?.applications;

      setApplications(Array.isArray(apps) ? apps : []);
      setPage(payload?.page || targetPage);
      setTotalPages(payload?.totalPages || 1);
    } catch (err) {
      setError(t('applicationList.loadingApplications') + ' ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(applicationId, newStatus) {
    try {
      await applicationAPI.updateApplicationStatus(applicationId, newStatus);
      setApplications(prev =>
        prev.map(app => (app.applicationId === applicationId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      setError('Failed to update status: ' + err.message);
    }
  }

  function sortApplications(apps) {
    const sorted = [...apps];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
      case 'status':
        return sorted.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
      default:
        return sorted;
    }
  }

  function filterApplications(apps) {
    if (filterStatus === 'all') return apps;
    return apps.filter(app => app.status === filterStatus);
  }

  function getDisplayApplications() {
    return sortApplications(filterApplications(applications));
  }

  function formatDate(dateString) {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-slate-800">{t('applicationList.title')}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => fetchApplications(page)}
            className="bg-blue-500 text-white border-0 px-6 py-3 text-base font-medium rounded-md cursor-pointer transition-colors hover:bg-blue-600"
            title="Refresh"
          >
            {t('applicationList.refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <span className="text-xl">{t('common.error')}</span>
          {error}
        </div>
      )}

      {!error && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="font-medium text-gray-700 text-sm">{t('applicationList.sortBy')}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white cursor-pointer min-w-[180px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="name">{t('applicationList.applicantName')}</option>
                <option value="status">{t('applicationList.status')}</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="font-medium text-gray-700 text-sm">{t('applicationList.filter')}</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white cursor-pointer min-w-[180px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="all">{t('applicationList.allApplications')}</option>
                <option value="unhandled">{t('applicationList.unhandled')}</option>
                <option value="accepted">{t('applicationList.accepted')}</option>
                <option value="rejected">{t('applicationList.rejected')}</option>
              </select>
            </div>
          </div>

          {getDisplayApplications().length === 0 ? (
            <div className="bg-white py-16 px-8 rounded-lg shadow-md text-center">
              <p className="text-xl font-semibold text-slate-800 mb-2">{t('applicationList.noApplications')}</p>
              <p className="text-gray-600 text-sm">{t('applicationList.noApplicationsDesc')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {getDisplayApplications().map((app) => (
                  <div key={app.applicationId} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-800 mb-1">{app.fullName}</h3>
                        <p className="text-gray-400 text-xs">Person Number: {app.personNumber}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${app.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : app.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {(app.status || 'unhandled').charAt(0).toUpperCase() + (app.status || 'unhandled').slice(1)}
                      </span>
                    </div>

                    <div className="p-6 border-b border-gray-200">
                      <h4 className="text-base font-semibold text-gray-700 mb-4">{t('applicationList.competenceProfile')}</h4>
                      {app.competenceProfiles?.length > 0 ? (
                        <ul className="list-none flex flex-col gap-3">
                          {app.competenceProfiles.map((cp, idx) => (
                            <li key={idx} className="flex justify-between items-center px-3 py-3 bg-gray-50 rounded-md border-l-4 border-blue-500">
                              <span className="font-medium text-slate-800">{cp.competenceName || 'Unknown'}</span>
                              <span className="text-gray-600 text-sm bg-white px-3 py-1 rounded-xl">
                                {cp.yearsOfExperience} {t('applicationList.years')}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No competencies listed</p>
                      )}
                    </div>

                    <div className="p-6 border-b border-gray-200">
                      <h4 className="text-base font-semibold text-gray-700 mb-4">{t('applicationList.availability')}</h4>
                      {app.availabilities?.length > 0 ? (
                        <ul className="list-none flex flex-col gap-3">
                          {app.availabilities.map((a, idx) => (
                            <li key={idx} className="px-3 py-3 bg-gray-50 rounded-md border-l-4 border-green-500">
                              <span className="text-slate-800 text-sm">
                                {formatDate(a.fromDate)} - {formatDate(a.toDate)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 italic text-sm">No availability periods listed</p>
                      )}
                    </div>

                    {(app.status || 'unhandled') === 'unhandled' && (
                      <div className="p-6 border-b border-gray-200 flex gap-3">
                        <button
                          onClick={() => handleStatusUpdate(app.applicationId, 'accepted')}
                          className="flex-1 bg-green-600 text-white border-0 px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors hover:bg-green-700"
                        >
                          {t('applicationList.accept')}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.applicationId, 'rejected')}
                          className="flex-1 bg-red-600 text-white border-0 px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors hover:bg-red-700"
                        >
                          {t('applicationList.reject')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center items-center gap-3 mt-10">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchApplications(page - 1)}
                  className="px-4 py-2 rounded border disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => fetchApplications(page + 1)}
                  className="px-4 py-2 rounded border disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ApplicationList;
