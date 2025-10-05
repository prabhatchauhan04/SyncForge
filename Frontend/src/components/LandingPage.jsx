import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center text-white">
      <h1 className="text-6xl font-extrabold mb-3 tracking-wide drop-shadow-lg">
        SyncForge
      </h1>
      <p className="text-gray-300 text-lg max-w-md mb-12">
        Collaborate. Code. Compile.
      </p>
      <button
        onClick={() => navigate('/signup')}
        className="bg-white text-black font-semibold px-10 py-3 rounded-full shadow-lg hover:bg-gray-200 transition transform active:scale-95"
      >
        Get Started
      </button>
    </div>
  );
};

export default LandingPage;
