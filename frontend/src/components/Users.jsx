import { useEffect, useState } from "react";
import fetchUsers from "../hooks/fetchUsers";
import { api } from "../api/api";
import "../styles/Users.css";
import EditUserModal from "./EditUserModal";

function ChangeRoleModal({ user, onClose, onSave }) {
  const [role, setRole] = useState(user.is_staff ? "admin" : "user");

  const handleSubmit = () => {
    const is_staff = role === "admin";
    onSave({ is_staff });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Change Role for {user.username}</h3>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <div className="modal-actions">
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [changingRoleUser, setChangingRoleUser] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error(error);
        setUsers(null);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await api.delete(`/api/users/${userId}/`);

      if (res.status !== 204 && res.status !== 200)
        throw new Error("Failed to delete user");

      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      alert("Failed to delete user.");
      console.error(error);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
  };

  const handleModalClose = () => {
    setEditingUser(null);
    setChangingRoleUser(null);
  };

  const handleSave = async (updatedData) => {
    try {
      const res = await api.patch(`/api/users/${editingUser.id}/`, updatedData);

      if (res.status !== 200) {
        throw new Error("Failed to update user");
      }

      const updatedUser = res.data;

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === editingUser.id ? updatedUser : u))
      );

      setEditingUser(null);
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  const handleRoleChangeSave = async (updatedData) => {
    try {
      const res = await api.patch(
        `/api/users/${changingRoleUser.id}/`,
        updatedData
      );

      if (res.status !== 200) {
        throw new Error("Failed to change role");
      }

      const updatedUser = res.data;

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === changingRoleUser.id ? updatedUser : u))
      );

      setChangingRoleUser(null);
    } catch (error) {
      alert("Failed to change role.");
      console.error(error);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (!users) return <div>Failed to load users or no users found.</div>;

  return (
    <>
      <h1>Users Table</h1>
      <h2>
        Here you can view a list of all registered users in the system. You have
        the ability to edit their information or delete them if necessary. Use
        the available actions to manage user accounts effectively.
      </h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date Joined</th>
            <th>Active</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{new Date(user.date_joined).toLocaleDateString()}</td>
              <td>{user.is_active ? "Yes" : "No"}</td>
              <td>{user.is_staff ? "Admin" : "User"}</td>
              <td>
                <button
                  className="editButton"
                  onClick={() => handleEditClick(user)}
                >
                  Edit
                </button>{" "}
                <button
                  className="deleteButton"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>{" "}
                <button
                  className="roleButton"
                  onClick={() => setChangingRoleUser(user)}
                >
                  Change Role
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}

      {changingRoleUser && (
        <ChangeRoleModal
          user={changingRoleUser}
          onClose={handleModalClose}
          onSave={handleRoleChangeSave}
        />
      )}
    </>
  );
}

export default Users;
