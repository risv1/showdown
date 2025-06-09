import { motion } from "framer-motion";
import { BiMedal, BiTrophy } from "react-icons/bi";
import { FiAward } from "react-icons/fi";
import type { Player } from "../../types/tournament";

interface PodiumProps {
  players: Player[];
}

export function Podium({ players }: PodiumProps) {
  const topThree = players.slice(0, 3);
  const remainingPlayers = players.slice(3);

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 0:
        return "h-32";
      case 1:
        return "h-24";
      case 2:
        return "h-20";
      default:
        return "h-16";
    }
  };

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 0:
        return <BiTrophy className="w-8 h-8 text-yellow-400" />;
      case 1:
        return <FiAward className="w-7 h-7 text-gray-300" />;
      case 2:
        return <BiMedal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 0:
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case 1:
        return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 2:
        return "from-amber-600/20 to-amber-700/20 border-amber-600/30";
      default:
        return "from-neutral-700/20 to-neutral-800/20 border-neutral-600/30";
    }
  };

  const podiumOrder =
    topThree.length >= 3
      ? [topThree[1], topThree[0], topThree[2]]
      : topThree.length === 2
      ? [null, topThree[0], topThree[1]]
      : topThree.length === 1
      ? [null, topThree[0], null]
      : [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-center gap-4 mb-8"
      >
        {podiumOrder.map((player, index) => {
          if (!player) return <div key={index} className="w-32" />;

          const originalPosition = topThree.findIndex((p) => p.id === player.id);
          // const isFirst = originalPosition === 0;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div
                className={`bg-gradient-to-br ${getPodiumColor(
                  originalPosition
                )} backdrop-blur-sm border rounded-xl p-4 mb-2 text-center min-w-32`}
              >
                <div className="flex justify-center mb-2">{getPodiumIcon(originalPosition)}</div>
                <h3 className="text-white font-bold text-lg mb-1">{player.username}</h3>
                <p className="text-neutral-300 text-sm">{player.points} pts</p>
                <p className="text-neutral-400 text-xs">
                  {player.wins}W - {player.losses}L
                </p>
              </div>

              <div
                className={`${getPodiumHeight(
                  originalPosition
                )} w-24 bg-gradient-to-t ${getPodiumColor(
                  originalPosition
                )} border rounded-t-lg flex items-end justify-center pb-2`}
              >
                <span className="text-white font-bold text-2xl">#{originalPosition + 1}</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {remainingPlayers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Other Participants</h3>
          <div className="space-y-3">
            {remainingPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400 font-mono text-sm w-8">#{player.rank}</span>
                  <span className="text-white font-medium">{player.username}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-neutral-300">{player.points} pts</span>
                  <span className="text-neutral-400">
                    {player.wins}W - {player.losses}L
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
