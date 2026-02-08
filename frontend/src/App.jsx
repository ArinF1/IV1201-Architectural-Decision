import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ApplicationSubmission from './pages/ApplicationSubmission';
import ApplicationList from './pages/ApplicationList';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Job Application System</h1>
          <ul className="flex gap-8 list-none">
            <li>
              <Link 
                to="/" 
                className="text-white no-underline px-4 py-2 rounded hover:bg-slate-700 transition-colors"
              >
                Submit Application
              </Link>
            </li>
            <li>
              <Link 
                to="/applications" 
                className="text-white no-underline px-4 py-2 rounded hover:bg-slate-700 transition-colors"
              >
                View Applications
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-8">
        <Routes>
          <Route path="/" element={<ApplicationSubmission />} />
          <Route path="/applications" element={<ApplicationList />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
