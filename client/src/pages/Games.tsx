
import { useEffect } from 'react';

export default function Games() {
  useEffect(() => {
    // Load game script after component mounts
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Games 👾</h1>
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">2D Platformer</h2>
          <iframe 
            src="/platformer.html"
            className="w-full aspect-[4/3] border-0 rounded-lg"
            title="2D Platformer Game"
          />
        </div>
      </div>
    </div>
  );
}
