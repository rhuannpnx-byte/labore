/**
 * Hook React para detectar status de conexão online/offline
 */

import { useState, useEffect } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Handler para quando ficar online
    const handleOnline = () => {
      console.log('🌐 Status: ONLINE');
      setIsOnline(true);
    };

    // Handler para quando ficar offline
    const handleOffline = () => {
      console.log('📴 Status: OFFLINE');
      setIsOnline(false);
    };

    // Adiciona listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default useOnlineStatus;
