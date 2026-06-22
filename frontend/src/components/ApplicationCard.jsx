import { updateApplication, deleteApplication } from '../api/applications.js';

const statusStyles = {
  wishlist: 'bg-slate-100 text-slate-700',
  applied: 'bg-blue-50 text-blue-700',
  interviewing: 'bg-amber-50 text-amber-700',
  offer: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
  withdrawn: 'bg-slate-100 text-slate-500',
};

const ApplicationCard = ({ application, onUpdated, onDeleted }) => {
  const handleStatusChange = async (e) => {
    const { data } = await updateApplication(application._id, { status: e.target.value });
    onUpdated(data);
  };

  const handleDelete = async () => {
    await deleteApplication(application._id);
    onDeleted(application._id);
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{application.role}</h3>
          <p className="text-sm text-slate-600">{application.company}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[application.status]}`}>
          {application.status}
        </span>
      </div>

      {application.location && <p className="mt-2 text-xs text-slate-500">{application.location}</p>}

      <div className="mt-4 flex items-center justify-between">
        <select
          value={application.status}
          onChange={handleStatusChange}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
        >
          {Object.keys(statusStyles).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button onClick={handleDelete} className="text-xs font-medium text-rose-600 hover:underline">
          Delete
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;