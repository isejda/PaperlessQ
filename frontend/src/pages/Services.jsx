import ServiceForm from "../components/ServiceForm";
import ServiceList from "../components/ServiceList";
import { useEffect, useState } from "react";
import { ACCESS_TOKEN } from "../constants";
import { FiBell } from "react-icons/fi";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const token = localStorage.getItem(ACCESS_TOKEN);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/notifications/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const all = response.data;
      setNotifications(all);
      setUnreadCount(all.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/notifications/${id}/mark-read/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <div className="App">
      <div className="notification-wrapper">
        <div
          className="notification-icon"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FiBell size={24} />
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </div>
        {showDropdown && (
          <div className="notification-dropdown">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.is_read ? "read" : "unread"
                  }`}
                  onClick={() => {
                    if (!notification.is_read) markAsRead(notification.id);
                  }}
                >
                  <p>{notification.message}</p>
                  <small>
                    {new Date(notification.created_at).toLocaleString()}
                  </small>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <ServiceList />
      <ServiceForm />
    </div>
  );
}

export default App;
