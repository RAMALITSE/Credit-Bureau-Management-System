// frontend/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="text-7xl font-bold text-blue-600 mb-4">404</div>
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;