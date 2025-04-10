
import { useEffect } from 'react';

export default function Games() {
  useEffect(() => {
    // Handle direct navigation to /games/index.html
    if (window.location.pathname === '/games') {
      const iframe = document.getElementById('game-iframe');
      if (iframe) {
        iframe.src = '/games/index.html';
      }
    }
  }, []);

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
