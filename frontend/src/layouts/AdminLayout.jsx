import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
import { useAuth } from "../context/useAuth";

function AdminLayout() {
  const { admin, setAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAdmin(null);
      navigate("/admin/login");
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>Dan</span>
          Restaurant
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/menu"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Menu
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Orders
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="sidebar-admin">
            <span>Signed in as</span>
            <strong>{admin?.name}</strong>
          </div>

          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

