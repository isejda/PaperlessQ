import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Home from "../components/Home";
import About from "../components/About";
import Profile from "../components/Profile";
import UserNavbar from "../components/UserNavbar";

function UserDashboard() {
  return (
    <>
      {" "}
      <UserNavbar />
      <Routes>
        <Route path="/" element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<div>Page not found in dashboard</div>} />
      </Routes>
    </>
  );
}

export default UserDashboard;
