import { useState, useEffect, useCallback } from 'react';
import { getApplications } from '../api/applications.js';
import { useSocket } from '../context/SocketContext.jsx';
import ApplicationForm from '../components/ApplicationForm.jsx';
import ApplicationCard from '../components/ApplicationCard.jsx';
import Button from '../components/Button.jsx';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { connected, subscribe, unsubscribe } = useSocket(); // useSocket provides the current connection status and functions to subscribe/unsubscribe to real-time events.

  useEffect(() => {
    const loadApplications = async () => {
      const { data } = await getApplications();
      setApplications(data.applications);
      setLoading(false);
    };
    loadApplications();
  }, []);

  // useCallback ensures these handler functions have stable references —
  // without it, a new function object is created on every render, which
  // would cause subscribe/unsubscribe to run in an infinite loop inside
  // the useEffect below (because the dependency would always look "new").
  const handleApplicationUpdated = useCallback((updatedApp) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === updatedApp._id ? updatedApp : app))
    );
  }, []);

  const handleCommentAdded = useCallback(({ applicationId, comment }) => {
    setApplications((prev) =>
      prev.map((app) =>
        app._id === applicationId
          ? { ...app, comments: [...app.comments, comment] }
          : app
      )
    );
  }, []);

  // Subscribe to real-time events when socket is connected.
  // Cleanup (unsubscribe) runs when component unmounts or dependencies change.
  useEffect(() => {
    if (!connected) return;

    subscribe('application:updated', handleApplicationUpdated);
    subscribe('application:comment-added', handleCommentAdded);

    return () => {
      unsubscribe('application:updated', handleApplicationUpdated);
      unsubscribe('application:comment-added', handleCommentAdded);
    };
  }, [connected, subscribe, unsubscribe, handleApplicationUpdated, handleCommentAdded]);

  const handleCreated = (newApp) => {
    setApplications([newApp, ...applications]);
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
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-slate-600">{applications.length} total</p>
            {/* Real-time connection indicator */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
              ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              <span className={`h-1.5 w-1.5 rounded-full
                ${connected ? 'bg-emerald-500' : 'bg-slate-400'}`}
              />
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
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
            <ApplicationCard
              key={app._id}
              application={app}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;