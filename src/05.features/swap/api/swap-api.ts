import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AssetsQueryArgs, AssetsResponse } from "@/06.entities/asset/model/types";
import type { SwapPreview, SwapPreviewRequest } from "../model/types";

export const swapApi = createApi({
  reducerPath: "swapApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/miex",
  }),
  endpoints: (builder) => ({
    getAssets: builder.query<AssetsResponse, AssetsQueryArgs>({
      query: ({ search = "", page }) => ({
        url: "assets",
        params: { search, page },
      }),
    }),
    previewSwap: builder.mutation<SwapPreview, SwapPreviewRequest>({
      query: (body) => ({
        url: "swap/preview",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLazyGetAssetsQuery, usePreviewSwapMutation } = swapApi;
