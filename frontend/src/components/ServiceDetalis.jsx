import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ServiceDetails.css";

const ServiceDetails = () => {
  const { id } = useParams();
  const token = localStorage.getItem(ACCESS_TOKEN);
  const userId = localStorage.getItem("user_id");

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchServiceDetails = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/services/${id}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setService(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load service details");
      setLoading(false);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/services/${id}/queue/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setService((prev) => ({
        ...prev,
        queue_entries: response.data.queue_entries,
        now_serving: response.data.now_serving,
      }));
    } catch (err) {
      console.error("Failed to fetch queue", err);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  // Njoftim kur i vjen radha përdoruesit
  useEffect(() => {
    if (
      service &&
      service.now_serving &&
      service.now_serving.user_id == userId
    ) {
      toast.success("Është radha jote për t'u shërbyer!");
    }
  }, [service?.now_serving]);

  const endServing = async () => {
    if (!window.confirm("Are you sure you want to end serving this client?"))
      return;

    setProcessing(true);

    try {
      await axios.delete(`http://127.0.0.1:8000/api/services/${id}/queue/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.reload();

      await fetchQueue();
    } catch (err) {
      alert("Failed to end serving");
      console.error(err);
    }

    setProcessing(false);
  };

  if (loading) return <p>Loading service details...</p>;
  if (error) return <p>{error}</p>;
  if (!service) return null;

  const nowServing = service.now_serving;

  return (
    <>
      <div
        className="service-details-container"
        style={{ display: "flex", gap: "2rem" }}
      >
        <div
          className="queue-sidebar"
          style={{ width: "250px", border: "1px solid #ccc", padding: "1rem" }}
        >
          <h3>Queue Entries</h3>
          {service.queue_entries.length === 0 ? (
            <p>No clients in queue</p>
          ) : (
            <ul>
              {service.queue_entries.map((entry) => (
                <li key={entry.user_id}>
                  User ID: {entry.user_id} | Joined:{" "}
                  {new Date(entry.joined_at).toLocaleString()}
                  {userId == entry.user_id && (
                    <button
                      onClick={leaveQueue}
                      disabled={processing}
                      style={{ marginLeft: "10px" }}
                    >
                      Leave Queue
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="service-main-content"
          style={{ flex: 1, border: "1px solid #ccc", padding: "1rem" }}
        >
          <h2>{service.title}</h2>
          <p>{service.content}</p>
          <p>
            <strong>Provider:</strong> {service.service_provider}
          </p>
          <p>
            <strong>Created at:</strong>{" "}
            {new Date(service.created_at).toLocaleString()}
          </p>

          {nowServing ? (
            <div style={{ marginTop: "2rem" }}>
              <h3>
                Klienti <em>{nowServing.username}</em> po shërbehet tani
              </h3>
              <button onClick={endServing} disabled={processing}>
                {processing ? "Processing..." : "End Serving"}
              </button>
            </div>
          ) : (
            <p>No client is currently being served.</p>
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default ServiceDetails;
