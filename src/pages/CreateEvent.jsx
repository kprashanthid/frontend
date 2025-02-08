import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateEvent() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !date) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/event`,
        { name, description, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/dashboard");
    } catch (error) {
      setError("Error creating event. Please try again.");
    }
  };

  return (
    <div className="p-20 h-screen mx-auto bg-gray-800 border border-gray-700 rounded-lg shadow-2xl ">
      <h1 className="text-3xl font-semibold text-indigo-500 mb-6">
        Create Event
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label className="block text-sm font-semibold text-gray-300">
            Event Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-600 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter event name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300">
            Event Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-600 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the event"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300">
            Event Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-600 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}

export default CreateEvent;
