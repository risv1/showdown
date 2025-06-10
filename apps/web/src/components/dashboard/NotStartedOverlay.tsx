import { motion } from "framer-motion";
import { FiClock, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import type { Tournament } from "../../types/tournament";

interface TournamentNotStartedOverlayProps {
  tournament: Tournament;
  onStartTournament: () => void;
  actionLoading: boolean;
}

export function TournamentNotStartedOverlay({
  tournament,
  onStartTournament,
  actionLoading,
}: TournamentNotStartedOverlayProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 sm:p-8 max-w-md w-full text-center"
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full border border-yellow-500/30 flex items-center justify-center">
          <FiClock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Tournament Not Started</h3>
        <p className="text-neutral-400 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
          This tournament has not begun yet.
          {tournament.isCreator
            ? " As the creator, you can start it when ready."
            : " Please wait for the creator to start the tournament."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 px-4 py-2 sm:py-3 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-300 transition-colors text-sm sm:text-base"
          >
            Go Back
          </button>
          {tournament.isCreator && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartTournament}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <FiPlay className="w-4 h-4" />
              {actionLoading ? "Starting..." : "Start Tournament"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
