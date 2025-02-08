import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  const [user, setUser] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  async function handleSignup() {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        user
      );
      localStorage.setItem("token", response.data.token);

      if (response.status === 201) {
        toast.success("You have successfully signed up 😊!");
      } else {
        toast.error("Signup failed 😞");
      }
      navigate("/dashboard");
    } catch (error) {
      console.log("Error", error.message);
      toast.error("Signup failed 😞");
    }
  }

  return (
    <div className="flex items-center bg-gray-50 h-screen justify-center">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Sign Up
        </h2>
        <label className="block text-sm font-medium text-gray-600">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          onChange={handleChange}
          placeholder="Enter username"
          className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <label className="block mt-4 text-sm font-medium text-gray-600">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          onChange={handleChange}
          placeholder="Enter email"
          className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <label className="block mt-4 text-sm font-medium text-gray-600">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          onChange={handleChange}
          placeholder="Enter password"
          className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          type="submit"
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
          onClick={handleSignup}
        >
          Sign Up
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
