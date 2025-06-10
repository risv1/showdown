import { motion } from "framer-motion";
import { useState } from "react";
import { FiX } from "react-icons/fi";

import type { Stage } from "../../types/tournament";

interface AddMatchModalProps {
  stage: Stage;
  onClose: () => void;
  onAddMatch: (stageId: number, data: { replayUrl: string; pointsWon?: number }) => void;
}

export function AddMatchModal({ stage, onClose, onAddMatch }: AddMatchModalProps) {
  const [replayUrl, setReplayUrl] = useState("");
  const [pointsWon, setPointsWon] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replayUrl || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await onAddMatch(stage.id, {
        replayUrl,
        pointsWon: pointsWon || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to add match:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Match to {stage.name}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Showdown Replay URL *
            </label>
            <input
              type="url"
              value={replayUrl}
              onChange={(e) => setReplayUrl(e.target.value)}
              placeholder="https://replay.pokemonshowdown.com/..."
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-neutral-400 mt-1">
              Players will be automatically detected from the replay
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Points Won by Winner
            </label>
            <input
              type="number"
              value={pointsWon}
              onChange={(e) => setPointsWon(Number(e.target.value))}
              min="0"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-red-500 disabled:opacity-50"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding Match..." : "Add Match"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
