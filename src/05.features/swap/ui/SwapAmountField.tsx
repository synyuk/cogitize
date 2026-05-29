"use client";

import type { Asset } from "@/06.entities/asset";
import { TokenSelect } from "./TokenSelect";

type SwapAmountFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  asset: Asset | null;
  disabledAssetId?: number;
  onAmountChange: (value: string) => void;
  onAssetChange: (asset: Asset) => void;
};

export const SwapAmountField = ({
  label,
  value,
  placeholder,
  asset,
  disabledAssetId,
  onAmountChange,
  onAssetChange,
}: SwapAmountFieldProps) => (
  <section className="px-5 py-4">
    <div className="mb-3 text-[14px] font-medium text-[#bdbdbd]">{label}</div>
    <div className="flex items-center gap-4">
      <TokenSelect
        value={asset}
        onChange={onAssetChange}
        disabledAssetId={disabledAssetId}
        variant="dark"
      />
      <input
        inputMode="decimal"
        value={value}
        onChange={(event) => onAmountChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-right text-[24px] font-semibold leading-none text-white outline-none placeholder:text-white max-[375px]:text-[22px]"
      />
    </div>
  </section>
);
