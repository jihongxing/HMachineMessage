'use client';

import { useState, useEffect } from 'react';

interface MapLocationProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function MapLocation({
  latitude,
  longitude,
  address,
  onLocationSelect,
}: MapLocationProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(newCoords);
          onLocationSelect?.(newCoords.lat, newCoords.lng);
        },
        (error) => {
          console.error('Failed to get location:', error);
        }
      );
    }
  };

  const geocodeAddress = async () => {
    if (!address) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/location/geocode`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        }
      );
      const data = await response.json();
      if (data.code === 0) {
        setCoords({ lat: data.data.latitude, lng: data.data.longitude });
        onLocationSelect?.(data.data.latitude, data.data.longitude);
      }
    } catch (error) {
      console.error('Failed to geocode:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          获取当前位置
        </button>
        {address && (
          <button
            onClick={geocodeAddress}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            根据地址定位
          </button>
        )}
      </div>

      {coords && (
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-sm">
            纬度: {coords.lat.toFixed(6)}, 经度: {coords.lng.toFixed(6)}
          </p>
          <div className="mt-2 h-64 bg-gray-300 rounded flex items-center justify-center">
            <p className="text-gray-600">地图显示区域（需集成地图SDK）</p>
          </div>
        </div>
      )}
    </div>
  );
}
