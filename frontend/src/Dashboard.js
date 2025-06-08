import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState('General Queries');
  const [comment, setComment] = useState('');
  const [requests, setRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'General Queries',
    'Product Features Queries',
    'Product Pricing Queries',
    'Product Feature Implementation Requests',
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user`, {
          withCredentials: true
        });
        setUser(res.data);
        window.Intercom('boot', {
          app_id: 'zhinabgq',
          user_id: res.data.id,
          name: res.data.displayName || res.data.name?.givenName || "Guest",
          email: res.data.emails?.[0]?.value,
          created_at: Math.floor(Date.now() / 1000)
        });
      } catch (error) {
        window.location.href = '/';
      }
    };

    fetchUser();

    return () => {
      window.Intercom('shutdown');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Please enter your query or feedback.");

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/requests`,
        { category, comment, user },
        { withCredentials: true }
      );

      if (!response.data.success) {
        alert(response.data.message || "Something went wrong. Please try again.");
        return;
      }

      setComment('');
      await loadRequests();

      if (response.data.intercomSuccess === false) {
        alert("Query submitted, but Intercom message failed. Our team has been notified.");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/requests/${category}`,
        { withCredentials: true }
      );
      setRequests(res.data);
    } catch (err) {
      console.error("Loading previous requests failed:", err);
    }
  };

  useEffect(() => {
    if (user) loadRequests();
  }, [category, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg p-8 space-y-6 border border-blue-100">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-blue-800">Welcome, {user?.displayName || user?.name?.givenName || "Guest"} 👋</h1>
          <p className="mt-2 text-gray-600 text-md">
            Need help or have suggestions? Submit your query or feedback below. 
            <br />For real-time support, chat with us instantly using the Intercom Messenger. 💬
          </p>
        </header>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-700 text-sm">
          🔍 All your previous queries are stored securely. 
          You can continue any past conversation via Messenger with full transparency.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Query Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              required
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Your Message</label>
            <textarea
              className="w-full border border-gray-300 rounded p-3"
              rows="4"
              placeholder="Type your message here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Query"}
            </button>

            <button
              type="button"
              onClick={() => window.Intercom('show')}
              className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition"
            >
              💬 Open Messenger
            </button>
          </div>
        </form>

        <section className="pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Previous Queries</h2>
          {requests.length === 0 ? (
            <p className="text-gray-500">No previous queries found for this category.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req._id || req.timestamp}
                  className="bg-white border-l-4 border-blue-400 p-4 rounded shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-blue-900">
                        {req.user?.name || "You"}
                      </p>
                      <p className="text-gray-700 mt-1">{req.comment}</p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(req.createdAt || req.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {req.status && (
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      req.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
