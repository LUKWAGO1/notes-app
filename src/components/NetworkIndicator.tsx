import React, { useEffect, useState } from 'react';

const NetworkIndicator: React.FC = () => {
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div style={{ background: '#ffecb3', color: '#663c00', padding: 10, textAlign: 'center' }}>
      You are offline — notes will be saved locally and synced when you are back online.
    </div>
  );
};

export default NetworkIndicator;
