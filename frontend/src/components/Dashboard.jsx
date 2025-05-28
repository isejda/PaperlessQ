import React, { useState, useEffect } from "react";
import fetchUserData from "../hooks/fetchUserData";
import { useNavigate } from "react-router-dom";
import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const data = await fetchUserData();
      if (!data) return navigate("/login");
      setUserData(data);
      setLoading(false);
    }

    loadUser();
  }, [navigate]);

  if (loading) return <div>Loading dashboard...</div>;

  if (userData.is_staff === true) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

export default Dashboard;
