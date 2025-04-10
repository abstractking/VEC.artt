
import { useEffect } from 'react';

export default function Games() {
  useEffect(() => {
    // Directly set the window location to the games page
    window.location.href = "/games/index.html";
  }, []);

  // Return a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Games Marketplace 👾</h1>
        <p className="text-lg mb-4">Redirecting to games marketplace...</p>
        <div className="animate-pulse">Loading...</div>
      </div>
    </div>
  );
}
