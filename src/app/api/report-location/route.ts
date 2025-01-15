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
      // 最も詳細な結果を使用（通常は最初の結果）
      const result = data.results[0];
      const addressComponents = result.address_components;

      // 住所要素のマッピング
      const addressMap: { [key: string]: string } = {};

      addressComponents.forEach((component: any) => {
        const types = component.types;
        if (types.includes("postal_code")) {
          addressMap.postalCode = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          addressMap.prefecture = component.long_name;
        } else if (
          types.includes("locality") ||
          types.includes("administrative_area_level_2")
        ) {
          addressMap.city = component.long_name;
        } else if (types.includes("sublocality_level_1")) {
          addressMap.district1 = component.long_name;
        } else if (types.includes("sublocality_level_2")) {
          addressMap.district2 = component.long_name;
        } else if (types.includes("sublocality_level_3")) {
          addressMap.district3 = component.long_name;
        } else if (types.includes("sublocality_level_4")) {
          addressMap.district4 = component.long_name;
        } else if (types.includes("premise")) {
          addressMap.premise = component.long_name;
        }
      });

      // 日本の住所形式で組み立て
      const formattedAddress = [
        addressMap.prefecture || "",
        addressMap.city || "",
        addressMap.district1 || "",
        addressMap.district2 || "",
        addressMap.district3 || "",
        addressMap.district4 || "",
        addressMap.premise || "",
      ]
        .filter(Boolean)
        .join("");

      return NextResponse.json({
        address: formattedAddress,
        fullDetails: {
          rawAddress: result.formatted_address,
          components: addressMap,
          allResults: data.results,
        },
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
