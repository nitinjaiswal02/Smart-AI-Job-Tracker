// This previews the status color-coding we'll wire up to real data in
// Phase 7 — each status gets a consistent color across the whole app.
const statusStyles = {
  applied: 'bg-blue-50 text-blue-700',
  interviewing: 'bg-amber-50 text-amber-700',
  offer: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
};

const Dashboard = () => {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h2 className="text-2xl font-bold text-slate-900">Your Applications</h2>
      <p className="mt-1 text-sm text-slate-600">Full tracking table coming in Phase 7.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {Object.entries(statusStyles).map(([status, classes]) => (
          <span key={status} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${classes}`}>
            {status}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;