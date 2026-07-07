import { useState } from "react";
import { updateApplication, deleteApplication } from "../api/applications.js";

const statusStyles = {
  wishlist: "bg-slate-100 text-slate-700",
  applied: "bg-blue-50 text-blue-700",
  interviewing: "bg-amber-50 text-amber-700",
  offer: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  withdrawn: "bg-slate-100 text-slate-500",
};

// Converts a stored Date/ISO string into the "YYYY-MM-DDTHH:mm" format
// that a datetime-local input expects as its value.
// ab hoga — local timezone use karega
const toDatetimeLocalValue = (isoString) => {
  const d = new Date(isoString);
  // getTimezoneOffset() returns difference in minutes (IST = -330)
  // We subtract it to convert UTC → local time correctly
  const localTime = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return localTime.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
};
const ApplicationCard = ({ application, onUpdated, onDeleted }) => {
  const [pickingDate, setPickingDate] = useState(false);
  const [interviewDateInput, setInterviewDateInput] = useState("");

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    if (newStatus === "interviewing" && !application.interviewDate) {
      setPickingDate(true);
      return;
    }

    const payload = { status: newStatus };
    if (newStatus !== "interviewing" && application.interviewDate) {
      payload.interviewDate = null;
    }

    const { data } = await updateApplication(application._id, payload);
    onUpdated(data);
  };

  // New: opens the date picker pre-filled with the CURRENT interviewDate,
  // so the user is editing the existing value instead of starting blank.
  const handleChangeDateClick = () => {
    setInterviewDateInput(toDatetimeLocalValue(application.interviewDate));
    setPickingDate(true);
  };

  const handleConfirmInterviewDate = async () => {
  if (!interviewDateInput) return;

  // datetime-local gives us "YYYY-MM-DDTHH:mm" — no timezone info.
  // We must explicitly tell JavaScript this is LOCAL time (IST),
  // then convert to UTC ISO string for the backend.
  // new Date("2026-07-08T10:00") treats it as LOCAL time automatically
  // but only in browser — Render server treats it as UTC. So we fix it:
  const localDate = new Date(interviewDateInput);
  const isoString = localDate.toISOString(); // converts to proper UTC ISO

  const { data } = await updateApplication(application._id, {
    status: 'interviewing',
    interviewDate: isoString, // send proper UTC ISO string
  });
  onUpdated(data);
  setPickingDate(false);
  setInterviewDateInput('');
};

  const handleCancelPickingDate = () => {
    setPickingDate(false);
    setInterviewDateInput("");
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
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[application.status]}`}
        >
          {application.status}
        </span>
      </div>

      {application.location && (
        <p className="mt-2 text-xs text-slate-500">{application.location}</p>
      )}

      {/* Interview date row now has a "Change" link next to it */}
      {application.status === "interviewing" &&
        application.interviewDate &&
        !pickingDate && (
          <p className="mt-2 flex items-center gap-2 text-xs font-medium text-amber-700">
            {new Date(application.interviewDate).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            <button
              onClick={handleChangeDateClick}
              className="text-[11px] font-medium text-amber-600 underline hover:text-amber-800"
            >
              Change
            </button>
          </p>
        )}

      {pickingDate && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <label className="block text-xs font-medium text-amber-800">
            When is the interview?
          </label>
          <input
            type="datetime-local"
            value={interviewDateInput}
            onChange={(e) => setInterviewDateInput(e.target.value)}
            className="mt-1 w-full rounded-lg border border-amber-300 px-2 py-1 text-xs"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleConfirmInterviewDate}
              disabled={!interviewDateInput}
              className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-40"
            >
              Confirm
            </button>
            <button
              onClick={handleCancelPickingDate}
              className="rounded-lg px-3 py-1 text-xs font-medium text-slate-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
        <button
          onClick={handleDelete}
          className="text-xs font-medium text-rose-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;
