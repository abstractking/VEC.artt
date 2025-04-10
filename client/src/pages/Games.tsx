import { useEffect } from 'react';

export default function Games() {
  useEffect(() => {
    // Redirect to the games index page
    window.location.href = '/games/index.html';
  }, []);

  // Return null to prevent any rendering while redirect happens
  return null;
}