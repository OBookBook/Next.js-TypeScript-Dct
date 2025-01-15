import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    // Google Maps Geocoding APIを使用して住所を取得
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=ja&region=JP&result_type=street_address|premise|sublocality|postal_code`;

    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // 最も詳細な結果を使用
      const addressComponents = data.results[0].address_components;

      // 住所要素のマッピング
      const addressParts: { [key: string]: string } = {};

      // 住所コンポーネントの解析
      addressComponents.forEach((component: any) => {
        const types = component.types;

        if (types.includes("postal_code")) {
          addressParts.postalCode = component.long_name;
        }
        if (types.includes("country")) {
          addressParts.country = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          addressParts.prefecture = component.long_name;
        }
        if (types.includes("administrative_area_level_2")) {
          addressParts.city = component.long_name;
        }
        if (types.includes("locality") && !addressParts.city) {
          addressParts.city = component.long_name;
        }
        if (types.includes("sublocality_level_1")) {
          addressParts.ward = component.long_name;
        }
        if (types.includes("sublocality_level_2")) {
          addressParts.district = component.long_name;
        }
        if (types.includes("sublocality_level_3")) {
          addressParts.block = component.long_name;
        }
        if (types.includes("sublocality_level_4")) {
          addressParts.subBlock = component.long_name;
        }
        if (types.includes("premise")) {
          addressParts.premise = component.long_name;
        }
        if (types.includes("street_number")) {
          addressParts.streetNumber = component.long_name;
        }
      });

      // 郵便番号を先頭に配置
      const postalCodeStr = addressParts.postalCode
        ? `〒${addressParts.postalCode} `
        : "";

      // 日本の住所形式で組み立て
      const addressStr = [
        addressParts.prefecture || "",
        addressParts.city || "",
        addressParts.ward || "",
        addressParts.district || "",
        addressParts.block || "",
        addressParts.subBlock || "",
        addressParts.streetNumber || "",
        addressParts.premise || "",
      ]
        .filter(Boolean)
        .join("");

      // 最終的な住所文字列
      const formattedAddress = postalCodeStr + addressStr;

      return NextResponse.json({
        address: formattedAddress,
        fullDetails: {
          rawComponents: addressParts,
          rawAddress: data.results[0].formatted_address,
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
