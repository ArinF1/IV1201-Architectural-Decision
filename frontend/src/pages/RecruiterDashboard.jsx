import React, { useEffect, useState } from 'react';
import { applicationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

function StatusBadge({ status }) {
  let color = 'bg-gray-300 text-gray-800';
  if (status === 'accepted') color = 'bg-green-200 text-green-800';
  else if (status === 'rejected') color = 'bg-red-200 text-red-800';
  else if (status === 'unhandled') color = 'bg-yellow-200 text-yellow-800';
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>;
}

export default function RecruiterDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await applicationAPI.getAllApplicationsRecruiter();
        setApplications(res.data.data || []);
      } catch (err) {
        setError('Kunde inte hämta ansökningar.');
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  // Kontrollera roll (kräver att user finns i localStorage)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'recruiter') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Rekryterarvy – Ansökningar</h2>
      {loading && <div>Laddar...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && applications.length === 0 && <div>Inga ansökningar.</div>}
      {!loading && applications.length > 0 && (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Namn</th>
              <th className="py-2 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 px-4">{app.fullName}</td>
                <td className="py-2 px-4"><StatusBadge status={app.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
