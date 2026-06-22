import { useState, useEffect } from 'react';
import { getApplications } from '../api/applications.js';
import ApplicationForm from '../components/ApplicationForm.jsx';
import ApplicationCard from '../components/ApplicationCard.jsx';
import Button from '../components/Button.jsx';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadApplications = async () => {
      const { data } = await getApplications();
      setApplications(data.applications);
      setLoading(false);
    };
    loadApplications();
  }, []);

  const handleCreated = (newApp) => {
    setApplications([newApp, ...applications]); // newest first, no extra fetch needed
    setShowForm(false);
  };

  const handleUpdated = (updatedApp) => {
    setApplications(applications.map((app) => (app._id === updatedApp._id ? updatedApp : app)));
  };

  const handleDeleted = (id) => {
    setApplications(applications.filter((app) => app._id !== id));
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your applications</h2>
          <p className="mt-1 text-sm text-slate-600">{applications.length} total</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ Add application'}
        </Button>
      </div>

      {showForm && (
        <div className="mt-6">
          <ApplicationForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="mt-8 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
          No applications yet. Add your first one to get started.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <ApplicationCard key={app._id} application={app} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;