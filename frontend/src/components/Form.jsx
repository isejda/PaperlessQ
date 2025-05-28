import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { api, apiNoAuth } from "../api/api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator";

function Form({ route, method }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .required("Username is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        )
        .required("Password is required"),
    }),

    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (method === "login") {
          const res = await api.post(route, values);
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
          navigate("/dashboard");
        } else {
          const res = await apiNoAuth.post(route, values);
          alert("Registration successful! You can now log in.");
          navigate("/login");
        }
      } catch (error) {
        console.log("Error response:", error.response);
        console.log("Error data:", error.response?.data);

        alert(
          error.response?.data?.detail ||
            "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="form-container">
      <h1>{name}</h1>

      <input
        className="form-input"
        type="text"
        name="username"
        placeholder="Username"
        value={formik.values.username}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.username && formik.errors.username && (
        <div className="error">{formik.errors.username}</div>
      )}

      <input
        className="form-input"
        type="password"
        name="password"
        placeholder="Password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.password && formik.errors.password && (
        <div className="error">{formik.errors.password}</div>
      )}

      {loading && <LoadingIndicator />}
      <button className="form-button" type="submit" disabled={loading}>
        {name}
      </button>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        {method === "login" ? (
          <p>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")}>Register here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login here</span>
          </p>
        )}
      </div>
    </form>
  );
}

export default Form;
