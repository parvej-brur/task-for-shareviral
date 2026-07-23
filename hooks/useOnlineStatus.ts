import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/** Device connectivity, for the offline indicator. */
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
