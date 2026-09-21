import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { api } from "../../services/api";
import { useAuth } from "../../context/useAuth";

function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await api.login({
        email,
        password,
      });

      setAdmin(data.admin);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <p className="admin-login-eyebrow">DAN RESTAURANT</p>

        <h1>Admin Login</h1>

        <p className="admin-login-subtitle">
          Sign in to manage your restaurant.
        </p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <a
          href="/admin/forgot-password"
          className="forgot-password"
        >
          Forgot your password?
        </a>
      </div>
    </div>
  );
}

export default AdminLogin;