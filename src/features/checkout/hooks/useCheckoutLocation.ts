"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const LOCATION_KEY = "saved_delivery_location";

function loadSavedLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useCheckoutLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [savedLocation, setSavedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const restaurantLocation = { lat: 4.7305116, lng: -74.2783364 };

  useEffect(() => {
    const saved = loadSavedLocation();
    if (saved) {
      setSavedLocation(saved);
      setLocation(saved);
    }
  }, []);

  const getLocation = (save = true) => {
    if (!navigator?.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(coords);
        setLocating(false);

        if (save) {
          localStorage.setItem(LOCATION_KEY, JSON.stringify(coords));
          setSavedLocation(coords);
          toast.success("Ubicación guardada para futuros pedidos");
        } else {
          toast.success("Ubicación actualizada");
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Permiso de ubicación denegado. Actívalo en tu navegador.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          toast.error("Ubicación no disponible en este momento");
        } else {
          toast.error("Tiempo de espera agotado. Intenta de nuevo.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const saveLocation = () => {
    if (!location) return;
    localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    setSavedLocation(location);
    toast.success("Ubicación guardada para próximos pedidos");
  };

  const clearSavedLocation = () => {
    localStorage.removeItem(LOCATION_KEY);
    setSavedLocation(null);
    setLocation(null);
    toast("Ubicación guardada eliminada", { icon: "🗑️" });
  };

  const sendRestaurantLocation = () => {
    const url = `https://www.google.com/maps?q=${restaurantLocation.lat},${restaurantLocation.lng}`;
    window.open(url, "_blank");
  };

  return { location, locating, savedLocation, getLocation, saveLocation, clearSavedLocation, sendRestaurantLocation };
}
