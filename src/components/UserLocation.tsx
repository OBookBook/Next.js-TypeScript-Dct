"use client";

import { useEffect, useState } from "react";

export function UserLocation() {
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError("位置情報の取得に失敗しました: " + err.message);
        }
      );
    }
  }, []);

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4">現在位置</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : location.latitude && location.longitude ? (
        <p>
          緯度: {location.latitude.toFixed(6)}, 経度:{" "}
          {location.longitude.toFixed(6)}
        </p>
      ) : (
        <p>位置情報を取得中...</p>
      )}
    </div>
  );
}
