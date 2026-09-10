import { useEffect, useRef } from 'react';
import { useTelemetryStore } from '../stores/useTelemetryStore';
import { useAlertsStore } from '../stores/useAlertsStore';
import { wsClient } from '../services/websocket';
import { LiveWsMessage } from '../types';
import { api } from '../services/api';

export function useLiveTelemetry() {
  const store = useTelemetryStore();
  const fetchAlerts = useAlertsStore((s) => s.fetchAlerts);
  const fallbackPollTimer = useRef<number | null>(null);

  useEffect(() => {
    // 1. Initial REST data fetch
    store.fetchFullTelemetry();
    fetchAlerts();

    // Prefer the operator's browser location over the demo coordinates.
    let locationWatchId: number | null = null;
    if (navigator.geolocation) {
      locationWatchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          store.setCurrentLocation(coords.latitude, coords.longitude);
          api.setLocation(coords.latitude, coords.longitude)
            .then((location) => store.setCurrentLocation(location.lat, location.lon, location.name))
            .catch((error) => console.warn('Could not sync current location with backend:', error));
        },
        (error) => console.warn('Could not read device location; using configured fallback:', error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }

    // 2. Connect WebSocket
    wsClient.connect();

    // 3. Status change listener
    const unsubStatus = wsClient.onStatusChange((status) => {
      store.setWsStatus(status);
    });

    // 4. Message listener
    const unsubMsg = wsClient.subscribe((msg: LiveWsMessage) => {
      store.applyWsMessage(msg);
    });

    // 5. Fallback polling mechanism in case WebSocket is unavailable
    const checkFallback = () => {
      if (wsClient.getStatus() !== 'CONNECTED') {
        store.fetchFullTelemetry();
      }
    };
    fallbackPollTimer.current = window.setInterval(checkFallback, 4000);

    return () => {
      unsubStatus();
      unsubMsg();
      if (fallbackPollTimer.current !== null) {
        clearInterval(fallbackPollTimer.current);
      }
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, []);

  return store;
}
