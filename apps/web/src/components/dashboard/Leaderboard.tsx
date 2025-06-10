import { motion } from "framer-motion";
import { BiTrophy } from "react-icons/bi";
import { FiUser } from "react-icons/fi";

import type { Player } from "../../types/tournament";

interface TournamentLeaderboardProps {
  players: Player[];
  onPlayerClick: (player: Player) => void;
}

export function TournamentLeaderboard({ players, onPlayerClick }: TournamentLeaderboardProps) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl overflow-hidden"
    >
      <div className="p-4 sm:p-6 border-b border-neutral-700/50">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <BiTrophy className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
          Leaderboard
        </h2>
      </div>

      <div className="block sm:hidden">
        <div className="divide-y divide-neutral-700/50">
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => onPlayerClick(player)}
              className="p-4 hover:bg-neutral-800/30 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-lg flex-shrink-0">{getRankDisplay(player.rank)}</span>
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm truncate">{player.username}</p>
                    <p className="text-neutral-400 text-xs truncate">{player.email}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-medium text-sm">{player.points} pts</p>
                  <p className="text-neutral-400 text-xs">
                    {player.wins}W/{player.losses}L
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-800/50">
            <tr>
              <th className="text-left p-4 text-neutral-400 font-medium text-sm">Rank</th>
              <th className="text-left p-4 text-neutral-400 font-medium text-sm">Player</th>
              <th className="text-left p-4 text-neutral-400 font-medium text-sm">Wins</th>
              <th className="text-left p-4 text-neutral-400 font-medium text-sm">Losses</th>
              <th className="text-left p-4 text-neutral-400 font-medium text-sm">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700/50">
            {players.map((player) => (
              <tr
                key={player.id}
                onClick={() => onPlayerClick(player)}
                className="hover:bg-neutral-800/30 cursor-pointer transition-colors"
              >
                <td className="p-4">
                  <span className="text-lg">{getRankDisplay(player.rank)}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{player.username}</p>
                      <p className="text-neutral-400 text-sm">{player.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-white font-medium">{player.wins}</td>
                <td className="p-4 text-white font-medium">{player.losses}</td>
                <td className="p-4 text-white font-medium">{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
