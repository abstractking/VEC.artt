
import { useEffect } from 'react';

export default function Games() {
  useEffect(() => {
    // Check if we're inside an iframe
    const isIframe = window.self !== window.top;
    
    if (!isIframe) {
      const iframe = document.getElementById('game-iframe');
      if (iframe) {
        iframe.src = '/games/index.html';
      }
    }
  }, []);

  // If we're inside the iframe, render just the games content
  if (window.self !== window.top) {
    return (
      <div className="w-full h-screen">
        <iframe
          id="game-iframe"
          className="w-full h-full border-0"
          title="Games Marketplace"
          src="/games/index.html"
        />
      </div>
    );
  }

  // Otherwise render with our normal layout height calculation
  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-background">
      <iframe
        id="game-iframe"
        className="w-full h-full border-0"
        title="Games Marketplace"
        src="/games/index.html"
      />
    </div>
  );
}
