import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function LoginPage() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!user.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!user.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // returns true if no errors
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // Stop if validation fails

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        user
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user.id);
      toast.success("Logged in successfully! ✅");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Invalid credentials");
    }
  };

  const handleGuestLogin = () => {
    toast.success("Logged in as a guest! ✅");
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm"
      >
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={user.email}
            className="border p-2 mb-1 w-full rounded-md"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={user.password}
            className="border p-2 mb-1 w-full rounded-md"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded mb-4 hover:bg-blue-600 transition"
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleGuestLogin}
          className="bg-gray-500 text-white p-2 w-full rounded mb-4 hover:bg-gray-600 transition"
        >
          Guest Login
        </button>
        <div className="text-center mt-4">
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-500 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
