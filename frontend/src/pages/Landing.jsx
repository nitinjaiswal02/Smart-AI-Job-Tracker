import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

const features = [
  {
    title: 'Track every application',
    description: 'Company, role, status, and notes — all in one organized place, instead of a forgotten spreadsheet.',
  },
  {
    title: 'AI resume scoring',
    description: 'Paste a job description and get your resume scored against it before you apply.',
  },
  {
    title: 'Never miss a follow-up',
    description: 'Automatic interview reminders and follow-up email drafts, sent right when you need them.',
  },
];

const Landing = () => {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Stop losing track of your job search.
        </h1>
        <p className="mt-5 text-lg text-slate-600">
          Smart Job Tracker keeps every application organized, scores your resume against real job
          descriptions, and reminds you before you miss an interview.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/register">
            <Button variant="primary">Get Started Free</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">I have an account</Button>
          </Link>
        </div>
      </div>

      <div className="mt-24 grid gap-8 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;