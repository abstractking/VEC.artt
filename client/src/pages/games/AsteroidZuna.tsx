import React, { useEffect, useRef } from 'react';

/**
 * AsteroidZuna Game Component
 * This component loads the AsteroidZuna game from the public folder
 */
const AsteroidZunaGame: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Add message listener for game events
    const handleMessage = (event: MessageEvent) => {
      // Handle any messages from the game
      if (event.data && event.data.type === 'GAME_EVENT') {
        console.log('Game event received:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Ensure the iframe is at full height
    const resizeIframe = () => {
      if (iframeRef.current) {
        iframeRef.current.style.height = `${window.innerHeight - 100}px`;
      }
    };
    
    window.addEventListener('resize', resizeIframe);
    resizeIframe();

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('resize', resizeIframe);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AsteroidZuna</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Navigate your spaceship through an asteroid field. Use arrow keys to move and space to shoot.
        </p>
      </div>
      
      <div className="w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <iframe
          ref={iframeRef}
          src="/games/asteroid-zuna/index.html"
          title="AsteroidZuna Game"
          className="w-full border-0"
          style={{ minHeight: '600px' }}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
      
      <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Game Controls</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Use <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">Arrow Keys</span> to move your ship</li>
          <li>Press <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">Space</span> to shoot</li>
          <li>Avoid asteroids and survive as long as possible</li>
          <li>Destroy asteroids to earn points</li>
        </ul>
      </div>
    </div>
  );
};

export default AsteroidZunaGame;