import { NextRequest, NextResponse } from "next/server";
import type { AssetsResponse } from "@/06.entities/asset";

const MIEX_API_URL = "https://api.miex.one/api/v1/public";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const upstreamUrl = new URL(`${MIEX_API_URL}/assets`);

  upstreamUrl.searchParams.set("search", searchParams.get("search") ?? "");
  upstreamUrl.searchParams.set("page", searchParams.get("page") ?? "1");

  const response = await fetch(upstreamUrl, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Failed to load assets" },
      { status: response.status },
    );
  }

  const payload = (await response.json()) as AssetsResponse;
  return NextResponse.json(payload);
};
