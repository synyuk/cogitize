export type SwapDirection = "from" | "to";

export type BalanceType = "main" | "trade";

export type SwapPreviewRequest = {
  fromAssetId: number;
  toAssetId: number;
  direction: SwapDirection;
  amount: string;
  balanceType: BalanceType[];
};

export type SwapPreview = {
  estimatedGive: string;
  estimatedReceive: string;
  estimatedRate: string;
  estimatedUsdtEquivalent: string;
};
