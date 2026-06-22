const Input = ({ label, error, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-700 ${
          error ? 'border-rose-400' : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default Input;
