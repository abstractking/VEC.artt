
import { useEffect, useState } from 'react';

export default function Games() {
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    // Check if we're inside an iframe
    setIsIframe(window.self !== window.top);
  }, []);

  // If we're inside the iframe, render just the games content without header
  if (isIframe) {
    return (
      <div className="w-full h-screen bg-background">
        <iframe
          id="game-iframe"
          className="w-full h-full border-0"
          title="Games Marketplace"
          src="/games/index.html"
          allow="fullscreen"
        />
      </div>
    );
  }

  // Otherwise render with the normal layout height calculation
  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Gaming Hub</h1>
        <iframe
          id="game-iframe"
          className="w-full h-full border-0 rounded-lg shadow-lg"
          title="Games Marketplace"
          src="/games/index.html"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
