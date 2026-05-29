import { NextRequest, NextResponse } from "next/server";
import type { SwapPreview, SwapPreviewRequest } from "@/05.features/swap/model";

const MIEX_SWAP_PREVIEW_URL = "https://devgateway.miex.one/api/swap/public/preview";

export const POST = async (request: NextRequest) => {
  const body = (await request.json()) as SwapPreviewRequest;

  const response = await fetch(MIEX_SWAP_PREVIEW_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);

    return NextResponse.json(payload ?? { message: "Failed to preview swap" }, {
      status: response.status,
    });
  }

  const payload = (await response.json()) as SwapPreview;
  return NextResponse.json(payload);
};
