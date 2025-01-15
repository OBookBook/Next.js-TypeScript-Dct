import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    // Google Maps Geocoding APIを使用して住所を取得
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=ja&region=JP`;

    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // 住所コンポーネントを解析
      const addressComponents = data.results[0].address_components;

      // 必要な住所要素を抽出
      const prefecture =
        addressComponents.find((component: any) =>
          component.types.includes("administrative_area_level_1")
        )?.long_name || "";

      const city =
        addressComponents.find(
          (component: any) =>
            component.types.includes("locality") ||
            component.types.includes("administrative_area_level_2")
        )?.long_name || "";

      const district =
        addressComponents.find((component: any) =>
          component.types.includes("sublocality_level_1")
        )?.long_name || "";

      const street =
        addressComponents.find(
          (component: any) =>
            component.types.includes("sublocality_level_2") ||
            component.types.includes("premise")
        )?.long_name || "";

      // 日本の住所形式で組み立て
      const formattedAddress =
        `${prefecture}${city}${district}${street}`.trim();

      return NextResponse.json({
        address: formattedAddress,
        fullDetails: data.results[0], // デバッグ用に完全な結果も含める
      });
    } else {
      return NextResponse.json(
        { message: "住所が見つかりませんでした" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { message: "住所の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
