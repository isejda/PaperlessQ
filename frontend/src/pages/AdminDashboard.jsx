import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import Services from "./Services";
import Users from "../components/Users";
import Profile from "../components/Profile";
import ServiceDetails from "../components/ServiceDetalis";

function AdminDashboard() {
  return (
    <>
      <AdminNavbar />
      <Routes>
        <Route path="/" element={<Navigate to="services" replace />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetails />} />
        <Route path="users" element={<Users />} />
        <Route path="profile" element={<Profile />} />
        <Route
          path="*"
          element={<div>Page not found in admin dashboard</div>}
        />
      </Routes>
    </>
  );
}

export default AdminDashboard;
