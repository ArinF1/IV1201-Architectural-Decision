import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { applicationAPI } from '../services/api';

function ApplicationSubmission() {
  const { t } = useTranslation();
  // Get user data from localStorage (set during login)
  const [userData] = useState(function() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      return {
        person_id: parsed.id,
        name: parsed.name,
        surname: parsed.surname,
        email: parsed.email,
        pnr: parsed.pnr,
      };
    }
    // Fallback to mock data if not logged in
    return {
      person_id: 1,
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      pnr: '19900101-1234',
    };
  });

  const [competencies, setCompetencies] = useState([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState([
    { competence_id: '', years_of_experience: '' },
  ]);
  const [availabilities, setAvailabilities] = useState([
    { from_date: '', to_date: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch available competencies on component mount
  useEffect(function() {
    fetchCompetencies();
  }, []);

  async function fetchCompetencies() {
    try {
      const response = await applicationAPI.getCompetencies();
      setCompetencies(response.data.data);
    } catch (err) {
      setError(t('applicationSubmission.failedLoadCompetencies') + ': ' + err.message);
    }
  }

  function addCompetence() {
    setSelectedCompetencies([
      ...selectedCompetencies,
      { competence_id: '', years_of_experience: '' },
    ]);
  }

  function removeCompetence(index) {
    if (selectedCompetencies.length > 1) {
      const updated = selectedCompetencies.filter(function(_, i) {
        return i !== index;
      });
      setSelectedCompetencies(updated);
      // Clear validation errors for removed field
      const newErrors = { ...validationErrors };
      delete newErrors[`competence_${index}`];
      delete newErrors[`experience_${index}`];
      setValidationErrors(newErrors);
    }
  }

  function updateCompetence(index, field, value) {
    const updated = [...selectedCompetencies];
    updated[index][field] = value;
    setSelectedCompetencies(updated);
    // Clear validation error for this field
    const errorKey = field === 'competence_id' ? `competence_${index}` : `experience_${index}`;
    if (validationErrors[errorKey]) {
      const newErrors = { ...validationErrors };
      delete newErrors[errorKey];
      setValidationErrors(newErrors);
    }
  }

  function addAvailability() {
    setAvailabilities([
      ...availabilities,
      { from_date: '', to_date: '' },
    ]);
  }

  function removeAvailability(index) {
    if (availabilities.length > 1) {
      const updated = availabilities.filter(function(_, i) {
        return i !== index;
      });
      setAvailabilities(updated);
      // Clear validation errors for removed field
      const newErrors = { ...validationErrors };
      delete newErrors[`from_date_${index}`];
      delete newErrors[`to_date_${index}`];
      setValidationErrors(newErrors);
    }
  }

  function updateAvailability(index, field, value) {
    const updated = [...availabilities];
    updated[index][field] = value;
    setAvailabilities(updated);
    // Clear validation error for this field
    const errorKey = `${field}_${index}`;
    if (validationErrors[errorKey]) {
      const newErrors = { ...validationErrors };
      delete newErrors[errorKey];
      setValidationErrors(newErrors);
    }
  }

  function validateForm() {
    const errors = {};

    // Validate competencies
    selectedCompetencies.forEach(function(comp, index) {
      if (!comp.competence_id) {
        errors[`competence_${index}`] = t('applicationSubmission.pleaseSelectCompetence');
      }
      if (comp.years_of_experience === '' || comp.years_of_experience < 0) {
        errors[`experience_${index}`] = t('applicationSubmission.pleaseEnterYears');
      }
      if (comp.years_of_experience > 99.99) {
        errors[`experience_${index}`] = t('applicationSubmission.yearsExceed');
      }
    });

    // Validate availabilities
    availabilities.forEach(function(avail, index) {
      if (!avail.from_date) {
        errors[`from_date_${index}`] = t('applicationSubmission.pleaseSelectStartDate');
      }
      if (!avail.to_date) {
        errors[`to_date_${index}`] = t('applicationSubmission.pleaseSelectEndDate');
      }
      if (avail.from_date && avail.to_date && new Date(avail.from_date) > new Date(avail.to_date)) {
        errors[`to_date_${index}`] = t('applicationSubmission.endDateAfterStart');
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      setError(t('applicationSubmission.errorMessage'));
      return;
    }

    setLoading(true);

    try {
      const applicationData = {
        person_id: userData.person_id,
        competencies: selectedCompetencies.map(function(comp) {
          return {
            competence_id: parseInt(comp.competence_id),
            years_of_experience: parseFloat(comp.years_of_experience),
          };
        }),
        availabilities: availabilities.map(function(avail) {
          return {
            from_date: avail.from_date,
            to_date: avail.to_date,
          };
        }),
      };

      await applicationAPI.submitApplication(applicationData);
      setSuccess(true);
      
      // Reset form
      setSelectedCompetencies([{ competence_id: '', years_of_experience: '' }]);
      setAvailabilities([{ from_date: '', to_date: '' }]);
      setValidationErrors({});

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(t('applicationSubmission.errorMessage') + ': ' + err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-8 text-slate-800">{t('applicationSubmission.title')}</h2>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <span className="text-xl">{t('common.error')}</span>
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-lg">
          <span className="text-xl">{t('common.success')}</span>
          {t('applicationSubmission.successMessage')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
        {/* Personal Information Section */}
        <section className="mb-10 pb-10 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-slate-800 mb-2">{t('applicationSubmission.personalInfo')}</h3>
          <p className="text-gray-600 text-sm mb-6">
            {t('applicationSubmission.personalInfoDesc')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t('applicationSubmission.firstName')}</label>
              <div className="text-base text-slate-800 py-2">{userData.name}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t('applicationSubmission.lastName')}</label>
              <div className="text-base text-slate-800 py-2">{userData.surname}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t('applicationSubmission.personNumber')}</label>
              <div className="text-base text-slate-800 py-2">{userData.pnr}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t('applicationSubmission.email')}</label>
              <div className="text-base text-slate-800 py-2">{userData.email}</div>
            </div>
          </div>
        </section>

        {/* Competence Profile Section */}
        <section className="mb-10 pb-10 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-slate-800 mb-2">{t('applicationSubmission.competenceProfile')}</h3>
          <p className="text-gray-600 text-sm mb-6">
            {t('applicationSubmission.competenceProfileDesc')}
          </p>

          {selectedCompetencies.map(function(comp, index) {
            return (
            <div key={index} className="flex gap-4 mb-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('applicationSubmission.areaOfExpertise')} <span className="text-red-600">{t('common.required')}</span>
                  </label>
                  <select
                    value={comp.competence_id}
                    onChange={function(e) { updateCompetence(index, 'competence_id', e.target.value); }}
                    className={`px-3 py-2 text-base border rounded-md transition-all bg-white ${
                      validationErrors[`competence_${index}`] 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                    } focus:outline-none focus:ring-4`}
                    disabled={loading}
                  >
                    <option value="">{t('applicationSubmission.selectCompetence')}</option>
                    {competencies.map(function(c) {
                      return (
                      <option key={c.competence_id} value={c.competence_id}>
                        {c.name}
                      </option>
                      );
                    })}
                  </select>
                  {validationErrors[`competence_${index}`] && (
                    <span className="text-red-600 text-sm">{validationErrors[`competence_${index}`]}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('applicationSubmission.yearsOfExperience')} <span className="text-red-600">{t('common.required')}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99.99"
                    step="0.01"
                    value={comp.years_of_experience}
                    onChange={function(e) { updateCompetence(index, 'years_of_experience', e.target.value); }}
                    className={`px-3 py-2 text-base border rounded-md transition-all ${
                      validationErrors[`experience_${index}`] 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                    } focus:outline-none focus:ring-4`}
                    placeholder="e.g., 2.5"
                    disabled={loading}
                  />
                  {validationErrors[`experience_${index}`] && (
                    <span className="text-red-600 text-sm">{validationErrors[`experience_${index}`]}</span>
                  )}
                </div>
              </div>

              {selectedCompetencies.length > 1 && (
                <button
                  type="button"
                  onClick={function() { removeCompetence(index); }}
                  className="bg-transparent border-0 text-red-600 text-2xl cursor-pointer px-2 py-2 w-10 h-10 rounded-md transition-colors hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed self-start"
                  disabled={loading}
                  aria-label="Remove competence"
                >
                  ✕
                </button>
              )}
            </div>
            );
          })}

          <button
            type="button"
            onClick={addCompetence}
            className="bg-transparent border-2 border-dashed border-gray-300 text-blue-600 px-6 py-3 text-sm font-medium rounded-md cursor-pointer transition-all w-full mt-2 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {t('applicationSubmission.addCompetence')}
          </button>
        </section>

        {/* Availability Section */}
        <section className="mb-10 pb-10">
          <h3 className="text-2xl font-semibold text-slate-800 mb-2">{t('applicationSubmission.availability')}</h3>
          <p className="text-gray-600 text-sm mb-6">
            {t('applicationSubmission.availabilityDesc')}
          </p>

          {availabilities.map(function(avail, index) {
            return (
            <div key={index} className="flex gap-4 mb-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('applicationSubmission.fromDate')} <span className="text-red-600">{t('common.required')}</span>
                  </label>
                  <input
                    type="date"
                    value={avail.from_date}
                    onChange={function(e) { updateAvailability(index, 'from_date', e.target.value); }}
                    className={`px-3 py-2 text-base border rounded-md transition-all ${
                      validationErrors[`from_date_${index}`] 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                    } focus:outline-none focus:ring-4`}
                    disabled={loading}
                  />
                  {validationErrors[`from_date_${index}`] && (
                    <span className="text-red-600 text-sm">{validationErrors[`from_date_${index}`]}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('applicationSubmission.toDate')} <span className="text-red-600">{t('common.required')}</span>
                  </label>
                  <input
                    type="date"
                    value={avail.to_date}
                    onChange={function(e) { updateAvailability(index, 'to_date', e.target.value); }}
                    className={`px-3 py-2 text-base border rounded-md transition-all ${
                      validationErrors[`to_date_${index}`] 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                    } focus:outline-none focus:ring-4`}
                    disabled={loading}
                  />
                  {validationErrors[`to_date_${index}`] && (
                    <span className="text-red-600 text-sm">{validationErrors[`to_date_${index}`]}</span>
                  )}
                </div>
              </div>

              {availabilities.length > 1 && (
                <button
                  type="button"
                  onClick={function() { removeAvailability(index); }}
                  className="bg-transparent border-0 text-red-600 text-2xl cursor-pointer px-2 py-2 w-10 h-10 rounded-md transition-colors hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed self-start"
                  disabled={loading}
                  aria-label="Remove availability"
                >
                  ✕
                </button>
              )}
            </div>
            );
          })}

          <button
            type="button"
            onClick={addAvailability}
            className="bg-transparent border-2 border-dashed border-gray-300 text-blue-600 px-6 py-3 text-sm font-medium rounded-md cursor-pointer transition-all w-full mt-2 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {t('applicationSubmission.addPeriod')}
          </button>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="bg-green-600 text-white border-0 px-10 py-4 text-base font-semibold rounded-md cursor-pointer transition-all hover:bg-green-700 hover:-translate-y-px active:translate-y-0 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? t('applicationSubmission.submitting') : t('applicationSubmission.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationSubmission;
