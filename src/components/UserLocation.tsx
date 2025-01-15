"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "0.5rem",
};

// マップのデフォルトオプションを関数として定義
const getMapOptions = (): google.maps.MapOptions => ({
  mapTypeControl: true,
  mapTypeId: "hybrid",
  scaleControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  zoomControl: true,
  controlSize: 30,
  mapTypeControlOptions: {
    style: 1, // HORIZONTAL_BAR = 1
    position: 3, // TOP_RIGHT = 3
    mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain"],
  },
  // 地図のスタイル設定
  styles: [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "on" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "on" }],
    },
  ],
});

const defaultCenter = {
  lat: 35.6762,
  lng: 139.6503,
};

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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          現在位置の確認
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {location.latitude && location.longitude ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">緯度</p>
                    <p className="font-mono">{location.latitude.toFixed(6)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">経度</p>
                    <p className="font-mono">{location.longitude.toFixed(6)}</p>
                  </div>
                </div>

                <LoadScript
                  googleMapsApiKey={
                    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
                  }
                >
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{
                      lat: location.latitude,
                      lng: location.longitude,
                    }}
                    zoom={18}
                    options={getMapOptions()}
                  >
                    <Marker
                      position={{
                        lat: location.latitude,
                        lng: location.longitude,
                      }}
                    />
                  </GoogleMap>
                </LoadScript>

                <Button
                  onClick={fetchAddress}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      住所を取得中...
                    </>
                  ) : (
                    "住所を取得"
                  )}
                </Button>

                {address && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">住所</p>
                    <p className="font-medium break-all">{address}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p className="text-muted-foreground">位置情報を取得中...</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
