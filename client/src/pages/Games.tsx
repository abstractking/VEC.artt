
import { useEffect } from 'react';
import { Link } from 'wouter';

export default function Games() {
  useEffect(() => {
    // Redirect to our HTML games marketplace
    window.location.href = "/games/index.html";
  }, []);

  // This component will render briefly before the redirect happens
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Games Marketplace 👾</h1>
      <p className="text-lg mb-4">Redirecting to games marketplace...</p>
      <div className="animate-pulse">Loading...</div>
      <p className="mt-4">
        If you are not redirected automatically, please{' '}
        <a href="/games/index.html" className="text-primary hover:underline">
          click here
        </a>.
      </p>
    </div>
  );
}
