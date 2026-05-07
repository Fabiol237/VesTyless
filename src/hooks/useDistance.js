'use client';
import { useState, useEffect, useCallback } from 'react';

export function useDistance() {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize from localStorage if available to avoid constant prompts
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

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(coords);
        localStorage.setItem('vestyle_user_location', JSON.stringify(coords));
        setIsLocating(false);
        setError(null);
      },
      (err) => {
        console.error("Erreur géolocalisation détaillée:", { code: err.code, message: err.message });
        
        let msg = "Impossible d'obtenir votre position.";
        
        if (err.code === 1) {
          msg = "Accès refusé. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.";
        } else if (err.code === 2) {
          msg = "Position indisponible. Vérifiez votre connexion internet ou votre signal GPS.";
        } else if (err.code === 3) {
          msg = "Délai d'attente dépassé. Réessayez dans un instant.";
        }

        // Check for HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          msg += " Note: La géolocalisation nécessite une connexion sécurisée (HTTPS).";
        }

        setError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity }
    );
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
