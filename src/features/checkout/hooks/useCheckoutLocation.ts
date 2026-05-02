"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function useCheckoutLocation() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const restaurantLocation = {
    lat: 4.7305116,
    lng: -74.2783364,
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        toast.error("No se pudo obtener la ubicación");
      },
    );
  };

  const sendRestaurantLocation = () => {
    const url = `https://www.google.com/maps?q=${restaurantLocation.lat},${restaurantLocation.lng}`;

    window.open(url, "_blank");
  };

  return {
    location,
    getLocation,
    sendRestaurantLocation,
  };
}
