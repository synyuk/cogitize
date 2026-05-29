"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Asset } from "@/06.entities/asset";
import { AssetToken } from "@/06.entities/asset";
import { useLazyGetAssetsQuery } from "../api";

type TokenSelectProps = {
  value: Asset | null;
  onChange: (asset: Asset) => void;
  disabledAssetId?: number;
  variant?: "light" | "dark";
};

const mergeAssets = (current: Asset[], next: Asset[]) => {
  const seen = new Set(current.map((asset) => asset.id));
  const uniqueNext = next.filter((asset) => !seen.has(asset.id));
  return [...current, ...uniqueNext];
};

export const TokenSelect = ({
  value,
  onChange,
  disabledAssetId,
  variant = "light",
}: TokenSelectProps) => {
  const t = useTranslations("swap");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loadAssets, { isFetching }] = useLazyGetAssetsQuery();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (pageToLoad: number, searchValue: string) => {
      const response = await loadAssets({
        page: pageToLoad,
        search: searchValue,
      }).unwrap();

      setHasNextPage(response.hasNextPage);
      setPage(response.currentPage);
      setAssets((current) =>
        pageToLoad === 1
          ? response.data
          : mergeAssets(current, response.data),
      );
    },
    [loadAssets],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const debounceId = setTimeout(() => {
      void fetchPage(1, search);
    }, 250);

    return () => clearTimeout(debounceId);
  }, [fetchPage, isOpen, search]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !isOpen || !hasNextPage || assets.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching) {
          void fetchPage(page + 1, search);
        }
      },
      { root: sentinel.closest("[data-token-list]"), threshold: 1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [assets.length, fetchPage, hasNextPage, isFetching, isOpen, page, search]);

  const selectedLabel = useMemo(
    () => (value ? value.symbol : t("selectToken")),
    [t, value],
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex min-w-[132px] items-center justify-between gap-2 rounded-[8px] text-left transition ${
          variant === "dark"
            ? "min-h-12 bg-transparent p-0 text-white"
            : "border border-[#dce3ee] bg-white px-3 shadow-sm hover:border-[#b6c2d4]"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <AssetToken asset={value} size="sm" />
          <span className="min-w-0">
            <span
              className={`block truncate font-semibold leading-none ${
                variant === "dark"
                  ? "text-[24px] text-white"
                  : "text-[15px] text-[#131820]"
              }`}
            >
              {selectedLabel}
            </span>
            {variant === "dark" && value ? (
              <span className="mt-2 block max-w-[112px] truncate text-[14px] leading-none text-[#a7a7a7]">
                {value.name}
              </span>
            ) : null}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className={`h-5 w-5 shrink-0 transition ${
            variant === "dark" ? "text-white" : "text-[#657188]"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-30 w-[320px] overflow-hidden rounded-[8px] border border-[#dce3ee] bg-white shadow-[0_18px_50px_rgba(20,32,52,0.16)]"
          >
            <div className="border-b border-[#edf1f6] p-3">
              <label className="flex h-11 items-center gap-2 rounded-[8px] bg-[#f5f7fb] px-3">
                <Search aria-hidden className="h-4 w-4 text-[#7b8798]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("searchToken")}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-[#131820] outline-none placeholder:text-[#8b96a8]"
                />
              </label>
            </div>
            <div data-token-list className="max-h-[292px] overflow-y-auto py-1">
              {assets.map((asset) => {
                const disabled = asset.id === disabledAssetId;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(asset);
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f5f7fb] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <AssetToken asset={asset} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-[#161c27]">
                        {asset.symbol}
                      </span>
                      <span className="block truncate text-[12px] text-[#758196]">
                        {asset.name}
                      </span>
                    </span>
                  </button>
                );
              })}
              {isFetching ? (
                <div className="px-4 py-3 text-[13px] text-[#758196]">
                  {t("loadingTokens")}
                </div>
              ) : null}
              {!isFetching && assets.length === 0 ? (
                <div className="px-4 py-6 text-center text-[13px] text-[#758196]">
                  {t("noTokens")}
                </div>
              ) : null}
              <div ref={sentinelRef} className="h-2" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
