import { useEffect } from 'react';

export default function Games() {
  return (
    <div className="w-full h-screen">
      <iframe 
        src="/games/index.html"
        className="w-full h-full border-0" 
        title="Games Marketplace"
      />
    </div>
  );
}