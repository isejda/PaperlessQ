import { useEffect, useState } from "react";
import axios from "axios";
import { ACCESS_TOKEN } from "../constants";
import "../styles/ServiceList.css";
import { useNavigate } from "react-router-dom";
import fetchUserData from "../hooks/fetchUserData";

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [updating, setUpdating] = useState(false);
  const [queuedServiceIds, setQueuedServiceIds] = useState([]);
  const [leavingQueue, setLeavingQueue] = useState(false);
  const [queueLoadingId, setQueueLoadingId] = useState(null);

  const token = localStorage.getItem(ACCESS_TOKEN);
  const [userData, setUserData] = useState(null);
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

  useEffect(() => {
    if (userData) {
      fetchServices();
    }
  }, [userData]);

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/services/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let fetchedServices = response.data;

      setServices(fetchedServices);
      setLoading(false);
    } catch (err) {
      setError("Failed to load services");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/services/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(services.filter((service) => service.id !== id));
    } catch (err) {
      alert("Failed to delete service");
      console.error(err);
    }
  };

  const startEditing = (service) => {
    setEditingId(service.id);
    setEditTitle(service.title);
    setEditContent(service.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleUpdate = async (id) => {
    setUpdating(true);
    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/services/${id}/`,
        { title: editTitle, content: editContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setServices(
        services.map((service) => (service.id === id ? response.data : service))
      );
      cancelEditing();
    } catch (err) {
      alert("Failed to update service");
      console.error(err);
    }
    setUpdating(false);
  };

  const handleService = async (serviceId) => {
    setQueueLoadingId(serviceId);
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/services/${serviceId}/queue/`,
        null, // empty body as null
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setQueuedServiceIds((prev) =>
        prev.includes(serviceId) ? prev : [...prev, serviceId]
      );
    } catch (err) {
      alert("Failed to handle service");
      console.error("Error:", err.response?.data || err.message);
    }
    setQueueLoadingId(null);
  };

  const handleLeaveQueue = async (serviceId) => {
    if (!window.confirm("Are you sure you want to leave the queue?")) return;

    setLeavingQueue(true);
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/services/${serviceId}/queue/leave/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("You have left the queue.");
      setQueuedServiceIds((prev) => prev.filter((id) => id !== serviceId));
    } catch (err) {
      console.error("Leave queue error:", err.response?.data || err.message);
      alert("Failed to leave queue");
    }
    setLeavingQueue(false);
  };

  if (loading) return <p className="loading-text">Loading services...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="service-list-container">
      <h2 className="service-list-title">Services List</h2>
      {services.length === 0 ? (
        <p className="no-services">No services found.</p>
      ) : (
        <ul className="service-list">
          {services.map((service) => (
            <li key={service.id} className="service-list-item">
              {editingId === service.id ? (
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    disabled={updating}
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={updating}
                  />
                  <button
                    onClick={() => handleUpdate(service.id)}
                    disabled={updating}
                  >
                    Save
                  </button>
                  <button onClick={cancelEditing} disabled={updating}>
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-content">{service.content}</p>
                  {userData.is_staff && (
                    <p>
                      <small>
                        Created at:{" "}
                        {new Date(service.created_at).toLocaleString()}
                        <br />
                        Provider: {service.service_provider}
                      </small>
                    </p>
                  )}

                  {userData.is_staff ? (
                    <>
                      <button onClick={() => startEditing(service)}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(service.id)}>
                        Delete
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/services/${service.id}`)
                        }
                      >
                        View
                      </button>
                    </>
                  ) : (
                    <>
                      {queuedServiceIds.includes(service.id) ? (
                        <div>
                          <p className="queue-message">
                            Your request is being processed. You will be
                            notified once it is complete.
                          </p>
                          <button
                            onClick={() => handleLeaveQueue(service.id)}
                            disabled={leavingQueue}
                          >
                            {leavingQueue ? "Leaving..." : "Leave Queue"}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleService(service.id)}
                          disabled={queueLoadingId === service.id}
                        >
                          {queueLoadingId === service.id
                            ? "Processing..."
                            : "Handle Service"}
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ServiceList;
