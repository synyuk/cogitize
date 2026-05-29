"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Asset } from "@/06.entities/asset/model";
import {
  useLazyGetAssetsQuery,
  usePreviewSwapMutation,
} from "../api";
import type { SwapDirection, SwapPreview } from "./types";

const PREVIEW_THROTTLE_MS = 600;

const emptyPreview = null;

type SwapController = {
  fromAsset: Asset | null;
  toAsset: Asset | null;
  fromAmount: string;
  toAmount: string;
  activeDirection: SwapDirection;
  preview: SwapPreview | null;
  isPreviewLoading: boolean;
  isPreviewError: boolean;
  isConfirmOpen: boolean;
  canConfirm: boolean;
  confirmationTextValues: {
    fromSymbol: string;
    toSymbol: string;
    giveAmount: string;
    receiveAmount: string;
  };
  setFromAsset: (asset: Asset) => void;
  setToAsset: (asset: Asset) => void;
  setFromAmount: (value: string) => void;
  setToAmount: (value: string) => void;
  swapAssets: () => void;
  confirmSwap: () => void;
  closeConfirmation: () => void;
};

const normalizeAmount = (value: string) =>
  value.replace(",", ".").replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

const findExactAsset = (assets: Asset[] | undefined, symbol: string) =>
  assets?.find((asset) => asset.symbol.toUpperCase() === symbol) ?? null;

export const useSwapController = (): SwapController => {
  const [fromAsset, setFromAssetState] = useState<Asset | null>(null);
  const [toAsset, setToAssetState] = useState<Asset | null>(null);
  const [fromAmount, setFromAmountState] = useState("");
  const [toAmount, setToAmountState] = useState("");
  const [activeDirection, setActiveDirection] = useState<SwapDirection>("from");
  const [preview, setPreview] = useState<SwapPreview | null>(emptyPreview);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isPreviewError, setIsPreviewError] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loadAssets] = useLazyGetAssetsQuery();
  const [previewSwap] = usePreviewSwapMutation();
  const lastPreviewAtRef = useRef(0);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const loadDefaults = async () => {
      const [usdtResponse, btcResponse] = await Promise.all([
        loadAssets({ search: "USDT", page: 1 }).unwrap(),
        loadAssets({ search: "BTC", page: 1 }).unwrap(),
      ]);

      setFromAssetState(findExactAsset(usdtResponse.data, "USDT"));
      setToAssetState(findExactAsset(btcResponse.data, "BTC"));
    };

    void loadDefaults();
  }, [loadAssets]);

  const resetAmounts = useCallback(() => {
    setFromAmountState("");
    setToAmountState("");
    setPreview(emptyPreview);
    setIsPreviewError(false);
  }, []);

  const setFromAsset = useCallback(
    (asset: Asset) => {
      setFromAssetState(asset);
      resetAmounts();
      setActiveDirection("from");
    },
    [resetAmounts],
  );

  const setToAsset = useCallback(
    (asset: Asset) => {
      setToAssetState(asset);
      resetAmounts();
      setActiveDirection("to");
    },
    [resetAmounts],
  );

  const setFromAmount = useCallback((value: string) => {
    setActiveDirection("from");
    setPreview(emptyPreview);
    setIsPreviewError(false);
    setFromAmountState(normalizeAmount(value));
  }, []);

  const setToAmount = useCallback((value: string) => {
    setActiveDirection("to");
    setPreview(emptyPreview);
    setIsPreviewError(false);
    setToAmountState(normalizeAmount(value));
  }, []);

  const amountForPreview = activeDirection === "from" ? fromAmount : toAmount;

  const runPreview = useCallback(async () => {
    if (!fromAsset || !toAsset || !amountForPreview || fromAsset.id === toAsset.id) {
      setPreview(emptyPreview);
      setIsPreviewLoading(false);
      setIsPreviewError(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsPreviewLoading(true);

    try {
      const result = await previewSwap({
        fromAssetId: fromAsset.id,
        toAssetId: toAsset.id,
        direction: activeDirection,
        amount: amountForPreview,
        balanceType: ["main", "trade"],
      }).unwrap();

      if (requestIdRef.current !== requestId) {
        return;
      }

      setPreview(result);
      setIsPreviewError(false);
      setFromAmountState(result.estimatedGive);
      setToAmountState(result.estimatedReceive);
    } catch {
      if (requestIdRef.current === requestId) {
        setPreview(emptyPreview);
        setIsPreviewError(true);
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsPreviewLoading(false);
      }
    }
  }, [activeDirection, amountForPreview, fromAsset, previewSwap, toAsset]);

  useEffect(() => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }

    if (!amountForPreview) {
      setPreview(emptyPreview);
      setIsPreviewLoading(false);
      setIsPreviewError(false);
      return;
    }

    const now = Date.now();
    const elapsed = now - lastPreviewAtRef.current;
    const delay = Math.max(PREVIEW_THROTTLE_MS - elapsed, 0);

    previewTimerRef.current = setTimeout(() => {
      lastPreviewAtRef.current = Date.now();
      void runPreview();
    }, delay);

    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, [amountForPreview, runPreview]);

  const swapAssets = useCallback(() => {
    setFromAssetState(toAsset);
    setToAssetState(fromAsset);
    setPreview(emptyPreview);
    setIsPreviewError(false);
  }, [fromAsset, toAsset]);

  const confirmSwap = useCallback(() => {
    if (preview) {
      setIsConfirmOpen(true);
    }
  }, [preview]);

  const closeConfirmation = useCallback(() => {
    setIsConfirmOpen(false);
    resetAmounts();
    setActiveDirection("from");
  }, [resetAmounts]);

  const confirmationTextValues = useMemo(
    () => ({
      fromSymbol: fromAsset?.symbol ?? "",
      toSymbol: toAsset?.symbol ?? "",
      giveAmount: preview?.estimatedGive ?? fromAmount,
      receiveAmount: preview?.estimatedReceive ?? toAmount,
    }),
    [fromAmount, fromAsset?.symbol, preview, toAmount, toAsset?.symbol],
  );

  return {
    fromAsset,
    toAsset,
    fromAmount,
    toAmount,
    activeDirection,
    preview,
    isPreviewLoading,
    isPreviewError,
    isConfirmOpen,
    canConfirm: Boolean(preview),
    confirmationTextValues,
    setFromAsset,
    setToAsset,
    setFromAmount,
    setToAmount,
    swapAssets,
    confirmSwap,
    closeConfirmation,
  };
};
