import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./AdminLogin.css";
import { api } from "../../services/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await api.resetPassword(token, password);

      setMessage(data.message || "Password reset successful.");

      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <p className="admin-login-eyebrow">DAN RESTAURANT</p>

        <h1>Reset Password</h1>

        <p className="admin-login-subtitle">
          Create a new password for your admin account.
        </p>

        {error && <p className="login-error">{error}</p>}

        {message && (
          <p className="login-success">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">New Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your new password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <Link to="/admin/login" className="forgot-password">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;