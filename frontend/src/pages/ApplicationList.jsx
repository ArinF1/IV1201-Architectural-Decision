import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { applicationAPI } from '../services/api';

/**
 * Recruiter view. Displays a paginated, filterable list of applications.
 * @returns {JSX.Element}
 */
function ApplicationList() {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState(() => searchParams.get('page') || '1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [competences, setCompetences] = useState([]);

  // Derive all filter/sort/page values from URL
  const sortBy = searchParams.get('sortBy') || 'status';
  const filterStatus = searchParams.get('status') || 'all';
  const filterCompetence = searchParams.get('competence') || 'all';
  const minExperience = searchParams.get('minExperience') || '';
  const availFrom = searchParams.get('availFrom') || '';
  const availTo = searchParams.get('availTo') || '';
  const page = Number(searchParams.get('page')) || 1;

  // Update a single filter param and reset page to 1
  function setFilter(key, value, defaultVal) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!value || value === defaultVal) next.delete(key); else next.set(key, value);
      next.delete('page');
      return next;
    }, { replace: true });
  }

  // Navigate to a specific page in the URL
  function goToPage(p) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (p <= 1) next.delete('page'); else next.set('page', String(p));
      return next;
    }, { replace: true });
    setPageInput(String(p));
  }

  // Fetch competencies once on mount
  useEffect(() => {
    applicationAPI.getCompetencies()
      .then(res => {
        const raw = res?.data?.data ?? res?.data ?? [];
        setCompetences(Array.isArray(raw) ? raw : []);
      })
      .catch(() => { });
  }, []);

  // Re-fetch whenever URL params change
  useEffect(() => {
    fetchApplications();
  }, [searchParams]);

  async function fetchApplications() {
    setLoading(true);
    setError('');
    try {
      const response = await applicationAPI.getApplications(page, 10, true, {
        sortBy,
        competence: filterCompetence !== 'all' ? filterCompetence : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        minExperience: minExperience || undefined,
        availFrom: availFrom || undefined,
        availTo: availTo || undefined,
      });

      const payload = response?.data?.data;
      const apps = payload?.applications;

      setApplications(Array.isArray(apps) ? apps : []);
      setPageInput(String(payload?.page || page));
      setTotalPages(payload?.totalPages || 1);
    } catch (err) {
      setError('applicationList.loadingApplications');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(applicationId, newStatus) {
    try {
      await applicationAPI.updateApplicationStatus(applicationId, newStatus);
      await fetchApplications();
    } catch (err) {
      setError('applicationList.updateStatusError');
    }
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
          <p>{t('applicationList.loading')}</p>
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
            onClick={() => fetchApplications()}
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
          {t(error)}
        </div>
      )}

      {!error && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex gap-6 flex-wrap items-end">
            {/* Sort */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">{t('applicationList.sortBy')}</label>
              <select
                value={sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value, 'status')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white cursor-pointer min-w-[180px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="status">{t('applicationList.sortStatus')}</option>
                <option value="experience">{t('applicationList.sortExperience')}</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">{t('applicationList.filterStatus')}</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilter('status', e.target.value, 'all')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white cursor-pointer min-w-[150px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">{t('applicationList.allApplications')}</option>
                <option value="unhandled">{t('applicationList.unhandled')}</option>
                <option value="accepted">{t('applicationList.accepted')}</option>
                <option value="rejected">{t('applicationList.rejected')}</option>
              </select>
            </div>

            {/* Competence filter */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">{t('applicationList.filterCompetence')}</label>
              <select
                value={filterCompetence}
                onChange={(e) => setFilter('competence', e.target.value, 'all')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white cursor-pointer min-w-[180px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">{t('applicationList.allCompetences')}</option>
                {competences.map(c => (
                  <option key={c.competenceId ?? c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Min experience */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">{t('applicationList.filterMinExperience')}</label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Any"
                value={minExperience}
                onChange={(e) => setFilter('minExperience', e.target.value, '')}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white w-[110px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Availability overlap */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">{t('applicationList.filterAvailability')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={availFrom}
                  onChange={(e) => setFilter('availFrom', e.target.value, '')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type="date"
                  value={availTo}
                  onChange={(e) => setFilter('availTo', e.target.value, '')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Clear filters */}
            {(filterStatus !== 'all' || filterCompetence !== 'all' || minExperience !== '' || availFrom !== '' || availTo !== '') && (
              <button
                onClick={() => {
                  setSearchParams(prev => {
                    const next = new URLSearchParams(prev);
                    ['status', 'competence', 'minExperience', 'availFrom', 'availTo', 'page'].forEach(k => next.delete(k));
                    return next;
                  }, { replace: true });
                }}
                className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 self-end"
              >
                {t('applicationList.clearFilters')}
              </button>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="bg-white py-16 px-8 rounded-lg shadow-md text-center">
              <p className="text-xl font-semibold text-slate-800 mb-2">{t('applicationList.noApplications')}</p>
              <p className="text-gray-600 text-sm">{t('applicationList.noApplicationsDesc')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {applications.map((app) => (
                  <div key={app.applicationId} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-800 mb-1">{app.fullName}</h3>
                        <p className="text-gray-400 text-xs">{t('applicationList.personNumber')}: {app.personNumber}</p>
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
                          {(app.competenceProfiles || []).map((cp, idx) => (
                            <li key={idx} className="flex justify-between items-center px-3 py-3 bg-gray-50 rounded-md border-l-4 border-blue-500">
                              <span className="font-medium text-slate-800">{cp.competenceName || 'Unknown'}</span>
                              <span className="text-gray-600 text-sm bg-white px-3 py-1 rounded-xl">
                                {cp.yearsOfExperience} {t('applicationList.years')}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 italic text-sm">{t('applicationList.noCompetencies')}</p>
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
                        <p className="text-gray-400 italic text-sm">{t('applicationList.noAvailability')}</p>
                      )}
                    </div>

                    {/* Action buttons - only shown for unhandled applications */}
                    {(app.status || 'unhandled') === 'unhandled' && (
                      <div className="p-6 flex gap-3">
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
                  onClick={() => goToPage(page - 1)}
                  className="px-4 py-2 rounded border disabled:opacity-40"
                >
                  {t('applicationList.prev')}
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>{t('applicationList.pageLabel')}</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={() => {
                      const val = Number(pageInput);
                      if (val >= 1 && val <= totalPages) goToPage(val);
                      else setPageInput(String(page));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = Number(pageInput);
                        if (val >= 1 && val <= totalPages) goToPage(val);
                        else setPageInput(String(page));
                        e.target.blur();
                      }
                    }}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  <span>{t('applicationList.ofPages')} {totalPages}</span>
                </div>
                <button
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="px-4 py-2 rounded border disabled:opacity-40"
                >
                  {t('applicationList.next')}
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
