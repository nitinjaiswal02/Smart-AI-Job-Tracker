import { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import { createApplication } from '../api/applications.js';

const ApplicationForm = ({ onCreated, onCancel }) => {
  const [formData, setFormData] = useState({ company: '', role: '', location: '', jobUrl: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await createApplication(formData);
      onCreated(data); // tell the parent (Dashboard) about the new application
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900">Add a new application</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input label="Company" name="company" value={formData.company} onChange={handleChange} required />
        <Input label="Role" name="role" value={formData.role} onChange={handleChange} required />
        <Input label="Location" name="location" value={formData.location} onChange={handleChange} />
        <Input label="Job URL" name="jobUrl" value={formData.jobUrl} onChange={handleChange} />
      </div>

      {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <div className="mt-5 flex gap-3">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save application'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ApplicationForm;