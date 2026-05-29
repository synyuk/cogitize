"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

type ConfirmationModalProps = {
  isOpen: boolean;
  message: string;
  onClose: () => void;
};

export const ConfirmationModal = ({
  isOpen,
  message,
  onClose,
}: ConfirmationModalProps) => {
  const t = useTranslations("swap");

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0f172a]/45 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[420px] rounded-[8px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.26)]"
          >
            <h2 className="text-[20px] font-bold text-[#121826]">
              {t("successTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-[#536175]">
              {message}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-12 w-full rounded-[8px] bg-[#1f6bff] text-[15px] font-semibold text-white transition hover:bg-[#1458d8]"
            >
              {t("ok")}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
