
import { useEffect, useRef } from 'react';

export default function Games() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && !iframeRef.current.src) {
      iframeRef.current.src = "/games/index.html";
    }
  }, []);

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <iframe 
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Games Marketplace"
      />
    </div>
  );
}
