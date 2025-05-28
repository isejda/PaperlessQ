import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = location.pathname.startsWith("/dashboard")
    ? "/dashboard/"
    : "/";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li>
          <NavLink
            to={`${basePath}services`}
            className={({ isActive }) => (isActive ? "active-link" : "link")}
          >
            Services
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`${basePath}users`}
            className={({ isActive }) => (isActive ? "active-link" : "link")}
          >
            Users
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`${basePath}profile`}
            className={({ isActive }) => (isActive ? "active-link" : "link")}
          >
            Profile
          </NavLink>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-button">
            Log out
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavbar;
