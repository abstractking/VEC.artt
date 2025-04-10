
import { useEffect, useState } from 'react';

export default function Games() {
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);

  const content = (
    <div className="w-full h-[calc(100vh-5rem)] rounded-lg overflow-hidden shadow-lg">
      <iframe
        id="game-iframe"
        className="w-full h-full border-0"
        title="Games Marketplace"
        src="/games/index.html"
        allow="fullscreen"
      />
    </div>
  );

  // If we're inside an iframe, render just the game content
  if (isIframe) {
    return (
      <div className="w-full h-screen">
        {content}
      </div>
    );
  }

  // Main layout for the games page
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Gaming Hub</h1>
      {content}
    </div>
  );
}
