import { motion } from "framer-motion";
import { useState } from "react";
import { FiExternalLink, FiX } from "react-icons/fi";

import type { Match, Player } from "../../types/tournament";

interface MatchModalProps {
  match: Match | null;
  players: Player[];
  onClose: () => void;
  onUpdate?: (
    matchId: number,
    data: { winnerId: number; loserId: number; pointsWon: number; replayUrl: string }
  ) => void;
}

export function MatchModal({ match, players, onClose, onUpdate }: MatchModalProps) {
  const [winnerId, setWinnerId] = useState<number | "">(match?.winnerId || "");
  const [pointsWon, setPointsWon] = useState(match?.pointsWon || 3);
  const [replayUrl, setReplayUrl] = useState(match?.replayUrl || "");
  const [isEditing, setIsEditing] = useState(false);

  if (!match) return null;

  const player1 = players.find((p) => p.id === match.player1Id);
  const player2 = players.find((p) => p.id === match.player2Id);
  const winner = players.find((p) => p.id === match.winnerId);

  const player1Pokemon = match.pokemon?.filter((p) => p.playerId === match.player1Id) || [];
  const player2Pokemon = match.pokemon?.filter((p) => p.playerId === match.player2Id) || [];

  const formatPokemonName = (pokemonName: string) => {
    return pokemonName.toLowerCase().replace(/\s+/g, "");
  };

  const capitalizeName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (winnerId && onUpdate) {
      const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;

      console.log("Updating match:", {
        matchId: match.id,
        winnerId: Number(winnerId),
        loserId,
        pointsWon,
        replayUrl: replayUrl.trim(),
      });

      onUpdate(match.id, {
        winnerId: Number(winnerId),
        loserId,
        pointsWon,
        replayUrl: replayUrl.trim(),
      });

      setIsEditing(false);
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
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Match Details</h2>
          <div className="flex gap-2">
            {onUpdate && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-500 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-neutral-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">{player1?.username}</p>
                  <p className="text-sm text-neutral-400">Player 1</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">VS</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">{player2?.username}</p>
                  <p className="text-sm text-neutral-400">Player 2</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Winner</label>
              <select
                value={winnerId}
                onChange={(e) => setWinnerId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Select Winner</option>
                <option value={match.player1Id}>{player1?.username}</option>
                <option value={match.player2Id}>{player2?.username}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Points Won</label>
              <input
                type="number"
                value={pointsWon}
                onChange={(e) => setPointsWon(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                min="0"
                max="10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Replay URL</label>
              <input
                type="url"
                value={replayUrl}
                onChange={(e) => setReplayUrl(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-500"
                placeholder="https://replay.pokemonshowdown.com/..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Update Match
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-neutral-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">{player1?.username}</p>
                  <p className="text-sm text-neutral-400">Player 1</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">VS</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">{player2?.username}</p>
                  <p className="text-sm text-neutral-400">Player 2</p>
                </div>
              </div>
            </div>

            {match.winnerId && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm">Winner</p>
                  <p className="text-white font-semibold">{winner?.username}</p>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-neutral-400 text-sm">Points Won</p>
                  <p className="text-white font-semibold">{match.pointsWon || 0}</p>
                </div>
              </div>
            )}

            {(player1Pokemon.length > 0 || player2Pokemon.length > 0) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Pokemon Used in Match</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-800/30 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-white mb-3 text-center">
                      {player1?.username}'s Team
                    </h4>
                    {player1Pokemon.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {player1Pokemon.map((pokemon, index) => (
                          <div key={index} className="text-center group">
                            <div className="w-16 h-16 mx-auto mb-2 relative border border-neutral-700/50 rounded-lg p-1 group-hover:border-red-500/30 transition-colors">
                              <img
                                src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${formatPokemonName(
                                  pokemon.pokemonName
                                )}.png`}
                                alt={pokemon.pokemonName}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                            <p className="text-xs text-neutral-400 group-hover:text-white transition-colors">
                              {capitalizeName(pokemon.pokemonName)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-400 text-sm text-center">
                        No pokemon data available
                      </p>
                    )}
                  </div>

                  <div className="bg-neutral-800/30 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-white mb-3 text-center">
                      {player2?.username}'s Team
                    </h4>
                    {player2Pokemon.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {player2Pokemon.map((pokemon, index) => (
                          <div key={index} className="text-center group">
                            <div className="w-16 h-16 mx-auto mb-2 relative border border-neutral-700/50 rounded-lg p-1 group-hover:border-red-500/30 transition-colors">
                              <img
                                src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${formatPokemonName(
                                  pokemon.pokemonName
                                )}.png`}
                                alt={pokemon.pokemonName}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                            <p className="text-xs text-neutral-400 group-hover:text-white transition-colors">
                              {capitalizeName(pokemon.pokemonName)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-400 text-sm text-center">
                        No pokemon data available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {match.replayUrl && (
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <p className="text-neutral-400 text-sm mb-2">Match Replay</p>
                <a
                  href={match.replayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 underline break-all"
                >
                  <FiExternalLink className="w-4 h-4 flex-shrink-0" />
                  View Replay
                </a>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
