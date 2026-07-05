import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // One handler for every input — React's "controlled component" pattern.
  // The `name` attribute on each <input> tells this function WHICH field
  // changed, so we don't need a separate handler per field.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser's default full-page-reload form submission
    setError("");
    setSubmitting(true);

    try {
      await login(formData);
      navigate("/dashboard");
    } catch (err) {
      // Our backend's errorHandler sends { message: "..." } — axios puts
      // that response body at err.response.data.
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-600">Log in to your account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-teal-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-teal-700 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
