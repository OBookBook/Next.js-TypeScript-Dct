"use client";

import { useEffect, useState } from "react";

export function UserLocation() {
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    } else {
      setError("このブラウザは位置情報をサポートしていません。");
    }
  }, []);

  const fetchAddress = async () => {
    if (!location.latitude || !location.longitude) {
      setError("位置情報が利用できません。");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/report-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAddress(data.address);
        console.log("Full address details:", data.fullDetails);
      } else {
        setError("住所の取得に失敗しました。");
      }
    } catch (err) {
      setError("住所の取得中にエラーが発生しました。");
      console.error("Error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">現在位置の確認</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-4">
          {location.latitude && location.longitude ? (
            <>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="mb-2">緯度: {location.latitude.toFixed(6)}</p>
                <p>経度: {location.longitude.toFixed(6)}</p>
              </div>
              <button
                onClick={fetchAddress}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "住所を取得中..." : "住所を取得"}
              </button>
              {address && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="font-medium">住所: {address}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              位置情報を取得中...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
