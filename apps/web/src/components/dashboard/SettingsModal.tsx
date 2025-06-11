import { motion } from "framer-motion";
import { useState } from "react";
import { FiPause, FiPlay, FiSettings, FiX } from "react-icons/fi";
import type { Stage } from "../../types/tournament";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: Stage[];
  onUpdateStageStatus: (stageId: number, started: boolean) => Promise<void>;
  isLoading: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  stages,
  onUpdateStageStatus,
  isLoading,
}: SettingsModalProps) {
  const [updatingStageId, setUpdatingStageId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleStageToggle = async (stageId: number, currentStatus: boolean) => {
    setUpdatingStageId(stageId);
    try {
      await onUpdateStageStatus(stageId, !currentStatus);
    } finally {
      setUpdatingStageId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FiSettings className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Tournament Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white mb-3">Stage Management</h3>

          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50"
            >
              <div>
                <h4 className="text-white font-medium">{stage.name}</h4>
                <p className="text-neutral-400 text-sm">{stage.playersSelected} players advance</p>
              </div>

              <button
                onClick={() => handleStageToggle(stage.id, stage.stageStarted)}
                disabled={isLoading || updatingStageId === stage.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  stage.stageStarted
                    ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300"
                    : "bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 hover:border-green-500 text-green-400 hover:text-green-300"
                }`}
              >
                {updatingStageId === stage.id ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : stage.stageStarted ? (
                  <FiPause className="w-4 h-4" />
                ) : (
                  <FiPlay className="w-4 h-4" />
                )}
                {stage.stageStarted ? "Stop Stage" : "Start Stage"}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
