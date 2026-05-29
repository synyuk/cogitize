"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Asset } from "../model";

type AssetTokenProps = {
  asset: Asset | null;
  size?: "sm" | "md";
};

const sizeClassName = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
};

export const AssetToken = ({ asset, size = "md" }: AssetTokenProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const initials = asset?.symbol.slice(0, 2).toUpperCase() ?? "--";

  useEffect(() => {
    setHasImageError(false);
  }, [asset?.assetImage]);

  return (
    <span
      className={`${sizeClassName[size]} relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef2f7] text-[11px] font-bold text-[#536175]`}
    >
      {asset?.assetImage && !hasImageError ? (
        <Image
          src={asset.assetImage}
          alt={asset.symbol}
          fill
          sizes={size === "md" ? "36px" : "28px"}
          className="object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
};
