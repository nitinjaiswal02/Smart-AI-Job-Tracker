import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import Button from '../components/Button.jsx';
import { getApplications } from '../api/applications.js';
import { useEffect } from 'react'; 

const TABS = [
  { id: 'score', label: 'Resume Score' },
  { id: 'ats', label: 'ATS Checker' },
  { id: 'followup', label: 'Follow-up Email' },
];

const ResumeAI = () => {
  const [activeTab, setActiveTab] = useState('score'); 
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // For the follow-up tab, we need the user's applications list so they
  // can pick which one to generate an email for.
  useEffect(() => { // 
    const loadApps = async () => {
      try {
        const { data } = await getApplications();
        setApplications(data.applications);
        if (data.applications.length > 0) {
          setSelectedAppId(data.applications[0]._id);
        }
      } catch (err) {
        // non-critical — just means the dropdown will be empty
        console.error('Could not load applications:', err);
      }
    };
    loadApps();
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    setError('');
    setResult(null);

    // Validation per tab
    if (activeTab === 'score') {
      if (!resumeText.trim()) return setError('Please paste your resume text');
      if (!jobDescription.trim()) return setError('Please paste the job description');
    }
    if (activeTab === 'ats') {
      if (!resumeText.trim()) return setError('Please paste your resume text');
    }
    if (activeTab === 'followup') {
      if (!selectedAppId) return setError('Please select an application');
    }

    setLoading(true);

    try {
      let data;

      if (activeTab === 'score') {
        const res = await api.post('/ai/score-resume', { resumeText, jobDescription });
        data = res.data;
      } else if (activeTab === 'ats') {
        const res = await api.post('/ai/ats-check', { resumeText });
        data = res.data;
      } else {
        const res = await api.post('/ai/generate-followup', { applicationId: selectedAppId });
        data = res.data;
      }

      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  //
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">AI Resume Analyzer</h2>
        <p className="mt-1 text-sm text-slate-600">
          Score your resume, check ATS compatibility, or generate a follow-up email.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mt-6 flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Input area — changes per tab */}
      <div className="mt-6">
        {activeTab === 'score' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextArea
              label="Your resume (plain text)"
              placeholder="Paste your full resume here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <TextArea
              label="Job description"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="max-w-xl">
            <TextArea
              label="Your resume (plain text)"
              placeholder="Paste your full resume here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'followup' && (
          <div className="max-w-md">
            <label className="block text-sm font-medium text-slate-700">
              Select application
            </label>
            {applications.length === 0 ? (
              <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                No applications found. Add some from the Dashboard first.
              </p>
            ) : (
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-700"
              >
                {applications.map((app) => (
                  <option key={app._id} value={app._id}>
                    {app.role} at {app.company} — {app.status}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-3 text-xs text-slate-500">
              AI will generate a personalized follow-up email based on the company,
              role, and how long ago you applied.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      )}

      <div className="mt-5">
        <Button
          variant="primary"
          onClick={handleAnalyze}
          disabled={loading || (activeTab === 'followup' && applications.length === 0)}
        >
          {loading ? 'Analyzing...' : activeTab === 'followup' ? 'Generate Email' : 'Analyze with AI'}
        </Button>
      </div>

      {/* Results — different component per tab */}
      {result && (
        <div className="mt-8 rounded-2xl border border-slate-200 p-6">
          {activeTab === 'score' && <ScoreResult result={result} />}
          {activeTab === 'ats' && <ATSResult result={result} />}
          {activeTab === 'followup' && <FollowUpResult result={result} />}
        </div>
      )}
    </div>
  );
};

// --- Reusable sub-components ---

const TextArea = ({ label, placeholder, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700">{label}</label>
    <textarea
      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-700"
      rows={14}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

const ScoreResult = ({ result }) => (
  <div>
    <div className="flex items-center gap-4">
      <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white
        ${result.score >= 70 ? 'bg-emerald-500' : result.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}>
        {result.score}
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">Resume Match Score</h3>
        <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
      </div>
    </div>
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      <ResultSection title="Strengths" items={result.strengths} color="emerald" />
      <ResultSection title="Improvements" items={result.improvements} color="amber" />
      <ResultSection title="Missing keywords" items={result.missingKeywords} color="rose" />
    </div>
  </div>
);

const ATSResult = ({ result }) => (
  <div>
    <div className="flex items-center gap-4">
      <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white
        ${result.isATSFriendly ? 'bg-emerald-500' : 'bg-rose-500'}`}>
        {result.score}
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">
          ATS Compatibility — {result.isATSFriendly ? 'Friendly ✓' : 'Issues Found'}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          {result.isATSFriendly
            ? 'Your resume should pass most ATS systems.'
            : 'Some issues may cause your resume to be filtered out.'}
        </p>
      </div>
    </div>
    <div className="mt-6 grid gap-4 sm:grid-cols-3">
      <ResultSection title="Issues found" items={result.issues} color="rose" />
      <ResultSection title="Suggestions" items={result.suggestions} color="amber" />
      <ResultSection title="Passed checks" items={result.passedChecks} color="emerald" />
    </div>
  </div>
);

const FollowUpResult = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Generated Follow-up Email</h3>
        <button
          onClick={handleCopy}
          className="text-sm font-medium text-teal-700 hover:underline"
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>

      {/* Subject line */}
      <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
        <p className="text-xs font-medium text-slate-500">Subject</p>
        <p className="mt-1 text-sm font-medium text-slate-900">{result.subject}</p>
      </div>

      {/* Email body */}
      <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3">
        <p className="text-xs font-medium text-slate-500">Body</p>
        <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{result.body}</p>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Review and personalize before sending — AI-generated emails are a starting point, not a final draft.
      </p>
    </div>
  );
};

const ResultSection = ({ title, items, color }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <ul className="mt-2 space-y-1">
        {items?.map((item, i) => (
          <li key={i} className={`rounded-lg px-3 py-2 text-xs ${colors[color]}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResumeAI;