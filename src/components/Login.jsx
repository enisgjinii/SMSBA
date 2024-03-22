import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import from react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for styling

const Login = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSuccess = (token) => {
    localStorage.setItem("token", token); // Store token in local storage
    const { from } = location.state || { from: { pathname: "/dashboard" } };
    window.location.href = from.pathname; // Redirect using window.location
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Input validation
      if (!formData.username || !formData.password) {
        toast.error("Please fill in all fields.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
        return;
      }

      // Show success toast first
      toast.success("Logging you in...", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds

      // Sanitize inputs to prevent SQL injection
      const sanitizedFormData = {
        username: formData.username.replace(/[&'"<>]/g, ""), // Remove potentially harmful characters
        password: formData.password, // Assuming password hashing is done securely on the server
      };

      const response = await axios.post(
        "http://localhost:5000/api/login",
        sanitizedFormData
      );

      console.log(response.data);
      handleLoginSuccess(response.data.token);
    } catch (error) {
      console.error("Error signing in: ", error);
      setError("Invalid username or password");

      toast.error("Invalid credentials. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <ToastContainer /> {/* Render ToastContainer here */}
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Welcome Back!
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex items-center justify-between mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
            <a
              className="inline-block align-baseline text-sm text-blue-500 hover:text-blue-800"
              href="#"
            >
              Forgot Password?
            </a>
          </div>
        </form>
        <p className="text-sm text-gray-600 text-center">
          Don't have an account?{" "}
          <Link
            className="font-semibold text-blue-500 hover:text-blue-800"
            to="/signup"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
