import { useState } from "react";
import { Link } from "react-router-dom";
import "./AdminLogin.css";
import { api } from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await api.forgotPassword(email);

      setMessage(data.message || "Reset link sent successfully.");
      setEmail("");
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

        <h1>Forgot Password?</h1>

      

        {error && <p className="login-error">{error}</p>}

        {message && (
          <p className="login-success">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link to="/admin/login" className="forgot-password">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;