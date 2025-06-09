import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";

interface EndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isLoading?: boolean;
}

export function EndModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  isLoading = false,
}: EndModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <p className="text-neutral-300 mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border border-neutral-600 hover:border-neutral-500 text-neutral-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-neutral-700/30"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 border border-red-600 hover:border-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
