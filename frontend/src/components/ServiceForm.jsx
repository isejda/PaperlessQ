import { useState } from "react";
import axios from "axios";
import { ACCESS_TOKEN } from "../constants";
import "../styles/ServiceForm.css";

const ServiceForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    const token = localStorage.getItem(ACCESS_TOKEN);
    console.log("Tokeni:", token);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/services/create/",
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Service created successfully!");
      setTitle("");
      setContent("");
      window.location.reload();
    } catch (error) {
      setError(true);
      setMessage("Error creating service.");
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="service-form-container">
      <h2>Create New Service</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>

        <button type="submit">Create Service</button>
      </form>

      {message && <p className={error ? "error" : ""}>{message}</p>}
    </div>
  );
};

export default ServiceForm;
