"use client";

import { motion } from "framer-motion";
import { ArrowDownUp, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConfirmationModal, SwapAmountField } from "@/05.features/swap/ui";
import { useSwapController } from "@/05.features/swap/model/useSwapController";

export const SwapWidget = () => {
  const t = useTranslations("swap");
  const swap = useSwapController();

  const successMessage = t("successMessage", {
    fromSymbol: swap.confirmationTextValues.fromSymbol,
    fromAmount: swap.confirmationTextValues.giveAmount,
    toSymbol: swap.confirmationTextValues.toSymbol,
    toAmount: swap.confirmationTextValues.receiveAmount,
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-[500px] rounded-[24px] bg-[#1f1f1f] p-10 shadow-[0_26px_70px_rgba(0,0,0,0.2)] max-[560px]:p-6"
      >
        <header className="mb-5">
          <h1 className="text-[22px] font-medium text-white">
            {t("title")}
          </h1>
        </header>

        <div className="relative rounded-[24px] border border-[#2f2f2f]">
          <SwapAmountField
            label={t("youSend")}
            value={swap.fromAmount}
            placeholder="0.00"
            asset={swap.fromAsset}
            disabledAssetId={swap.toAsset?.id}
            onAmountChange={swap.setFromAmount}
            onAssetChange={swap.setFromAsset}
          />

          <div className="relative h-px bg-[#d8d8d8]">
            <button
              type="button"
              onClick={swap.swapAssets}
              className="absolute right-10 top-1/2 z-10 inline-flex h-12 w-12 translate-y-[-50%] items-center justify-center rounded-full bg-[#2b2b2b] text-[#00dd45] shadow-sm transition hover:bg-[#343434]"
              aria-label={t("swapAssets")}
              title={t("swapAssets")}
            >
              <ArrowDownUp aria-hidden className="h-5 w-5" />
            </button>
          </div>

          <SwapAmountField
            label={t("youReceive")}
            value={swap.toAmount}
            placeholder="0.00"
            asset={swap.toAsset}
            disabledAssetId={swap.fromAsset?.id}
            onAmountChange={swap.setToAmount}
            onAssetChange={swap.setToAsset}
          />
        </div>

        <div className="mt-4 min-h-10 rounded-[8px] px-1 py-2 text-[14px] text-[#a7a7a7]">
          {swap.isPreviewLoading ? (
            <span className="inline-flex items-center gap-2">
              <RefreshCw aria-hidden className="h-4 w-4 animate-spin" />
              {t("calculating")}
            </span>
          ) : swap.preview ? (
            <span>
              {t("rate")}:{" "}
              <strong className="font-semibold text-white">
                1 {swap.fromAsset?.symbol} = {swap.preview.estimatedRate}{" "}
                {swap.toAsset?.symbol}
              </strong>
            </span>
          ) : swap.isPreviewError ? (
            <span className="text-[#c2410c]">{t("previewError")}</span>
          ) : (
            t("ratePlaceholder")
          )}
        </div>

        <button
          type="button"
          disabled={!swap.canConfirm}
          onClick={swap.confirmSwap}
          className="mt-6 h-[56px] w-full rounded-[8px] bg-[#00dd45] text-[16px] font-semibold text-[#07120a] transition hover:bg-[#06c842] disabled:cursor-not-allowed disabled:bg-[#2f4b38] disabled:text-[#809687]"
        >
          {t("confirm")}
        </button>
      </motion.div>

      <ConfirmationModal
        isOpen={swap.isConfirmOpen}
        message={successMessage}
        onClose={swap.closeConfirmation}
      />
    </>
  );
};
