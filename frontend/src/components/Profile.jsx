import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import "../styles/Profile.css";
import fetchUserData from "../hooks/fetchUserData";

function Profile() {
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUserData();
      if (!userData) {
        navigate("/login");
        return;
      }
      setUser(userData);
      setCurrentUserId(userData.id);
      setLoading(false);
    };

    loadUser();
  }, [navigate]);

  const openModal = () => {
    setEditUsername(user.username);
    setEditFirstName(user.first_name || "");
    setEditLastName(user.last_name || "");
    setEditPassword("");
    setCurrentPassword("");
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveUserData = async () => {
    if (!currentPassword) {
      setMessage({
        type: "error",
        text: "Please enter your current password.",
      });
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

    if (editPassword && !passwordRegex.test(editPassword)) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters long, contain one uppercase letter, one number, and one special character.",
      });
      return;
    }

    try {
      const payload = {
        username: editUsername,
        first_name: editFirstName,
        last_name: editLastName,
        current_password: currentPassword,
      };

      if (editPassword.trim() !== "") {
        payload.password = editPassword;
      }

      const response = await api.patch(`/api/users/${currentUserId}/`, payload);

      setUser(response.data);
      setMessage({ type: "success", text: "User data updated successfully!" });
      closeModal();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 400) {
        setMessage({ type: "error", text: "Current password is incorrect." });
      } else {
        setMessage({ type: "error", text: "Failed to update user data." });
      }
    } finally {
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!user) return null;

  return (
    <>
      <div className="profile-container">
        <h2>Your profile</h2>
        <p className="profile-subtitle">
          Here you can view and update your personal information.
        </p>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>First Name:</strong> {user.first_name || "-"}
        </p>
        <p>
          <strong>Last Name:</strong> {user.last_name || "-"}
        </p>
        <p>
          <strong>Date Joined:</strong>{" "}
          {new Date(user.date_joined).toLocaleDateString()}
        </p>

        <button onClick={openModal} className="edit-button">
          Edit Profile
        </button>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile</h3>

            <label>
              Username:
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </label>

            <label>
              First Name:
              <input
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
              />
            </label>

            <label>
              Last Name:
              <input
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
              />
            </label>

            <label>
              Current Password: <span style={{ color: "red" }}>*</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </label>

            <label>
              New Password:
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </label>

            <div className="modal-buttons">
              <button onClick={saveUserData} className="save-button">
                Save
              </button>
              <button onClick={closeModal} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
