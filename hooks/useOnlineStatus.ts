import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/** Tracks device connectivity for the offline indicator (assessment 4.5). */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected !== false);
    });
    return unsubscribe;
  }, []);

  return isOnline;
}
