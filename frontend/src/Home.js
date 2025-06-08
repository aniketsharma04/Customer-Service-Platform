import React, { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    if (window.Intercom) {
      window.Intercom('shutdown'); 
    }
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:8080/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-6">TensorGo Customer Service</h1>
        <button
          onClick={handleLogin}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg shadow hover:bg-gray-100"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Home;
