import { useState } from "react";
import "../styles/Users.css";

function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    is_active: user.is_active || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit User {user.username}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Username:
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              disabled // disable nëse nuk do e lejojme ndryshimin e username
            />
          </label>
          <label>
            First Name:
            <input
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
            />
          </label>
          <label>
            Last Name:
            <input
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
            />
          </label>
          <label>
            Active:
            <input
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
            />
          </label>
          <div className="modal-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
