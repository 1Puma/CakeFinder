import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref");
  const key = getEnv().GOOGLE_PLACES_API_KEY;
  if (!ref || !key) {
    return NextResponse.json({ error: "Photo unavailable." }, { status: 404 });
  }
  const media = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=800&key=${key}`;
  const response = await fetch(media);
  if (!response.ok) {
    return NextResponse.json({ error: "Photo unavailable." }, { status: 404 });
  }
  return new NextResponse(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
