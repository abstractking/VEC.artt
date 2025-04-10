
import { useEffect, useState } from 'react';

export default function Games() {
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);

  // If we're inside an iframe, render just the game content
  if (isIframe) {
    return (
      <div className="w-full h-screen">
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

  // Main layout for the games page
  return (
    <main className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Gaming Hub</h1>
        <div className="w-full h-[calc(100vh-12rem)] rounded-lg overflow-hidden shadow-lg">
          <iframe
            id="game-iframe"
            className="w-full h-full border-0"
            title="Games Marketplace"
            src="/games/index.html"
            allow="fullscreen"
          />
        </div>
      </div>
    </main>
  );
}
