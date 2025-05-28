import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

function UserNavbar() {
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
            to={`${basePath}home`}
            className={({ isActive }) => (isActive ? "active-link" : "link")}
          >
            Home
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
          <NavLink
            to={`${basePath}about`}
            className={({ isActive }) => (isActive ? "active-link" : "link")}
          >
            About
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

export default UserNavbar;
