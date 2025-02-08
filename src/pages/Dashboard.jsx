import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { debounce } from "lodash";

const socket = io(import.meta.env.VITE_API_URL);

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [attendEventTrigger, setAttendEventTrigger] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const debouncedSearch = debounce((query) => {
    setSearchQuery(query);
  }, 0);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/event/allEvents`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEvents(res.data);
        setFilteredEvents(res.data);
      })
      .catch((err) => {
        toast.error("Failed to load events.");
        console.error(err);
      });

    socket.on("updateAttendees", ({ eventId, userId }) => {
      setEvents((prevEvents) => {
        return prevEvents.map((event) =>
          event._id === eventId
            ? {
                ...event,
                attendees: [...event.attendees, userId],
                attendeesCount: event.attendees.length + 1,
              }
            : event
        );
      });
      setFilteredEvents((prevFilteredEvents) => {
        return prevFilteredEvents.map((event) =>
          event._id === eventId
            ? {
                ...event,
                attendees: [...event.attendees, userId],
                attendeesCount: event.attendees.length + 1,
              }
            : event
        );
      });
    });

    return () => {
      socket.off("updateAttendees");
    };
  }, [token, attendEventTrigger]);

  useEffect(() => {
    let filtered = events;

    if (filter === "upcoming") {
      filtered = events.filter((event) => new Date(event.date) > new Date());
    } else if (filter === "past") {
      filtered = events.filter((event) => new Date(event.date) < new Date());
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filter, searchQuery]);

  const handleUpdateEvent = async (eventId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/event/${eventId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId ? { ...event, ...formData } : event
        )
      );
      setFilteredEvents((prevFilteredEvents) =>
        prevFilteredEvents.map((event) =>
          event._id === eventId ? { ...event, ...formData } : event
        )
      );
      toast.success("Event updated successfully!");
      setModalOpen(false);
    } catch (error) {
      toast.error("Failed to update event.");
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/event/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
      setFilteredEvents((prevFilteredEvents) =>
        prevFilteredEvents.filter((event) => event._id !== eventId)
      );
      toast.success("Event deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete event.");
      console.error("Error deleting event:", error);
    }
  };

  const handleAttendEvent = async (eventId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/event/${eventId}/attend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.reload();
      socket.emit("attendEvent", { eventId, userId: token });
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  const handleEditClick = (event) => {
    setCurrentEvent(event);

    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toISOString().split("T")[0] + "T00:00";

    setFormData({
      name: event.name,
      description: event.description,
      date: formattedDate,
    });
    setModalOpen(true);
  };

  const handleLogout = () => {
    if (token) {
      localStorage.removeItem("token");
      toast.success("Logged out successfully!");
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6 text-white">
      <h1 className="text-4xl font-extrabold text-center text-indigo-400 mb-8">
        Event Dashboard
      </h1>
      <div className="flex flex-wrap justify-between items-center mb-8">
        <button
          onClick={() => {
            token
              ? navigate("/create-event")
              : toast.info("🔐 Please log in to continue.");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-105"
        >
          Create New Event
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 transform transition-all duration-200 hover:scale-105"
        >
          {token ? "Logout" : "Login"}
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search events..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 p-3 rounded-lg w-1/3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="all">All Events</option>
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.length === 0 ? (
          <p className="col-span-full text-center text-gray-400">
            No events found
          </p>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-2xl p-6"
            >
              <h2 className="text-3xl font-semibold text-indigo-500">
                {event.name}
              </h2>
              <p className="text-gray-400 mt-2">{event.description}</p>
              <p className="text-gray-500 mt-4">
                {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-gray-300 mt-2">
                Attendees: {event.attendees.length}
              </p>
              {token && (
                <div className="mt-4 space-x-4 flex flex-1">
                  <button
                    onClick={() => handleEditClick(event)}
                    className="bg-yellow-600 w-full hover:bg-yellow-700 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transform transition-all duration-200 hover:scale-105"
                  >
                    Edit Event
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="bg-red-600 w-full hover:bg-red-700 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transform transition-all duration-200 hover:scale-105"
                  >
                    Delete Event
                  </button>
                  <button
                    onClick={() => handleAttendEvent(event._id)}
                    className="bg-green-600 w-full hover:bg-green-700 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transform transition-all duration-200 hover:scale-105"
                  >
                    Attend Event
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg w-full sm:w-1/2 md:w-1/3">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-400">
              Update Event
            </h2>
            <form>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-300">
                  Event Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-gray-900 text-white border border-gray-700 p-3 w-full mt-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-300">
                  Event Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-gray-900 text-white border border-gray-700 p-3 w-full mt-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="date" className="block text-gray-300">
                  Event Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="bg-white text-black border border-gray-700 p-3 w-full mt-2 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => handleUpdateEvent(currentEvent._id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
