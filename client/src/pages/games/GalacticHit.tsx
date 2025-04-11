import React, { useEffect, useRef } from 'react';

/**
 * Galactic Hit Game Component
 * This component loads the Galactic Hit game from the public folder
 */
const GalacticHitGame: React.FC = () => {
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
        <h1 className="text-3xl font-bold mb-2">Galactic Hit</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your reaction time and accuracy in this fast-paced space shooter game.
        </p>
      </div>
      
      <div className="w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <iframe
          ref={iframeRef}
          src="/games/galactic-hit.html"
          title="Galactic Hit Game"
          className="w-full border-0"
          style={{ minHeight: '600px' }}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
      
      <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Game Controls</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Use <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">Mouse</span> to aim</li>
          <li>Click to shoot at the targets</li>
          <li>Hit as many targets as possible before time runs out</li>
          <li>Different targets have different point values</li>
        </ul>
      </div>
    </div>
  );
};

export default GalacticHitGame;