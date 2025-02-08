import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; // Import Link for navigation

const SignUpPage = () => {
  const [user, setUser] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!password) {
      return "Password is required";
    } else if (!strongPasswordRegex.test(password)) {
      return "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
    }
    return "";
  };

  async function handleSignup() {
    const passwordError = validatePassword(user.password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        user
      );
      localStorage.setItem("token", response.data.token);

      if (response.status === 201) {
        toast.success("You have successfully signed up 😊!");
        navigate("/dashboard");
      } else {
        toast.error("Signup failed 😞");
      }
    } catch (error) {
      console.log("Error", error.message);
      toast.error("Signup failed 😞");
    }
  }

  const handleGuestLogin = () => {
    setUser({
      userName: "GuestUser",
      email: "guest@example.com",
      password: "Guest@1234",
    });
    toast.success("Guest mode enabled!");
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Sign Up
        </h2>
        <label className="block text-sm font-medium text-gray-600 mt-4">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="userName"
          onChange={handleChange}
          value={user.userName}
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
          value={user.email}
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
          value={user.password}
          placeholder="Enter password"
          className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}

        <button
          type="submit"
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
          onClick={handleSignup}
        >
          Sign Up
        </button>

        <button
          className="w-full mt-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
          onClick={handleGuestLogin}
        >
          Guest Login
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
