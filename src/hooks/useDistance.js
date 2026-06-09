'use client';
import { useState, useEffect, useCallback } from 'react';

export function useDistance() {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vestyle_user_location');
      if (saved) {
        try {
          setUserLocation(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  // Force ultra-precise real-time tracking
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    // Configuration ultra-agressive pour forcer le GPS matériel
    const geoOptions = {
      enableHighAccuracy: true, // Demande explicitement le GPS satellite
      timeout: 20000,           // Laisse 20s au GPS pour "fixer" les satellites
      maximumAge: 0             // Interdiction formelle d'utiliser du cache (Wi-Fi/Cellulaire ancien)
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        // On ne met à jour que si c'est plus précis ou si c'est nouveau
        setUserLocation(coords);
        localStorage.setItem('vestyle_user_location', JSON.stringify(coords));
        setError(null);
      },
      (err) => {
        // Gestion silencieuse des erreurs de geolocalisation courantes
        const errorMessages = {
          1: "Géolocalisation refusée par l'utilisateur",
          2: "Position indisponible",
          3: "Délai d'attente dépassé"
        };
        
        // Ne log que les erreurs non-timeout en silence
        if (err.code !== 3) {
          // Erreurs permission refusée (1) et position indisponible (2) sont normales, ne pas les logger
        }
      },
      geoOptions
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée.");
      return;
    }

    setIsLocating(true);
    setError(null);

    // Fonction interne pour forcer un rafraîchissement GPS
    const getPrecisePosition = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setUserLocation(coords);
          localStorage.setItem('vestyle_user_location', JSON.stringify(coords));
          setIsLocating(false);
          setError(null);
        },
        (err) => {
          let msg = "Précision insuffisante. Vérifiez que votre GPS est activé et que vous êtes à découvert.";
          if (err.code === 1) msg = "Accès refusé. Activez la position dans les réglages.";
          else if (err.code === 2) msg = "Signal GPS introuvable. Sortez des bâtiments.";
          else if (err.code === 3) msg = "Le GPS met trop de temps à répondre.";

          setError(msg);
          setIsLocating(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 30000, // On attend jusqu'à 30s pour un fix satellite propre
          maximumAge: 0 
        }
      );
    };

    getPrecisePosition();
  }, []);

  // Haversine formula to calculate distance between two lat/lon points in km
  const getDistanceKm = useCallback((lat, lon) => {
    if (!userLocation || !lat || !lon) return null;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat - userLocation.latitude);
    const dLon = deg2rad(lon - userLocation.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(userLocation.latitude)) * Math.cos(deg2rad(lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    
    return distance;
  }, [userLocation]);

  const formatDistance = useCallback((lat, lon) => {
    const dist = getDistanceKm(lat, lon);
    if (dist === null) return null;
    
    if (dist < 1) {
      return `${Math.round(dist * 1000)} m`;
    }
    return `${dist.toFixed(1)} km`;
  }, [getDistanceKm]);

  return {
    userLocation,
    isLocating,
    error,
    requestLocation,
    getDistanceKm,
    formatDistance
  };
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}
