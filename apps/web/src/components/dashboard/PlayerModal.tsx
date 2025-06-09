import { motion } from "framer-motion";
import { useState } from "react";
import { FiChevronDown, FiChevronRight, FiUser, FiX } from "react-icons/fi";
import { usePokemon } from "../../hooks/pokemon";

import type { Player } from "../../types/tournament";

interface PlayerModalProps {
  player: Player | null;
  onClose: () => void;
  tournamentStages?: Array<{ id: number; name: string }>;
}

export function PlayerModal({ player, onClose, tournamentStages }: PlayerModalProps) {
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());
  const { formatForDisplay } = usePokemon();

  if (!player) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleStage = (stageId: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const getAllPokemon = () => {
    if (!player.stageTeams) return [];

    const allPokemon = new Set<string>();
    Object.values(player.stageTeams).forEach((team) => {
      team.forEach((pokemon) => allPokemon.add(pokemon));
    });

    return Array.from(allPokemon);
  };

  const allPokemon = getAllPokemon();
  const hasStageTeams = player.stageTeams && Object.keys(player.stageTeams).length > 0;

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
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{player.username}</h2>
              <p className="text-neutral-400">{player.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <p className="text-neutral-400 text-sm">Joined</p>
              <p className="text-white font-semibold">{formatDate(player.joinDate)}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <p className="text-neutral-400 text-sm">Rank</p>
              <p className="text-white font-semibold">#{player.rank}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{player.wins}</p>
              <p className="text-neutral-400 text-sm">Wins</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{player.losses}</p>
              <p className="text-neutral-400 text-sm">Losses</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{player.points}</p>
              <p className="text-neutral-400 text-sm">Points</p>
            </div>
          </div>

          {hasStageTeams && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Pokémon Teams</h3>

              {allPokemon.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-neutral-300">All Pokémon Used</h4>
                    <span className="text-sm text-neutral-400">{allPokemon.length}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-3">
                    {allPokemon.slice(0, 12).map((pokemon, index) => (
                      <div key={index} className="text-center group cursor-pointer">
                        <div className="w-12 h-12 mx-auto mb-1 relative border border-neutral-700/50 rounded-lg p-1 group-hover:border-red-500/30 transition-colors">
                          <img
                            src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${pokemon}.png`}
                            alt={formatForDisplay(pokemon)}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                        <p className="text-xs text-neutral-400 group-hover:text-white transition-colors">
                          {formatForDisplay(pokemon)}
                        </p>
                      </div>
                    ))}
                    {allPokemon.length > 12 && (
                      <div className="text-center flex items-center justify-center">
                        <span className="text-neutral-400 text-sm">+{allPokemon.length - 12}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tournamentStages && (
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-neutral-300">Teams by Stage</h4>
                  {tournamentStages.map((stage) => {
                    const stageTeam = player.stageTeams?.[stage.id];
                    if (!stageTeam || stageTeam.length === 0) return null;

                    const isExpanded = expandedStages.has(stage.id);

                    return (
                      <div key={stage.id} className="border border-neutral-700/50 rounded-lg">
                        <button
                          onClick={() => toggleStage(stage.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-800/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">{stage.name}</span>
                            <span className="text-neutral-400 text-sm">
                              ({stageTeam.length} Pokémon)
                            </span>
                          </div>
                          {isExpanded ? (
                            <FiChevronDown className="w-4 h-4 text-neutral-400" />
                          ) : (
                            <FiChevronRight className="w-4 h-4 text-neutral-400" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4">
                            <div className="grid grid-cols-6 gap-3">
                              {stageTeam.map((pokemon, index) => (
                                <div key={index} className="text-center group cursor-pointer">
                                  <div className="w-12 h-12 mx-auto mb-1 relative border border-neutral-700/50 rounded-lg p-1 group-hover:border-red-500/30 transition-colors">
                                    <img
                                      src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${pokemon}.png`}
                                      alt={formatForDisplay(pokemon)}
                                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  </div>
                                  <p className="text-xs text-neutral-400 group-hover:text-white transition-colors">
                                    {formatForDisplay(pokemon)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!hasStageTeams && (
            <div className="text-center py-8">
              <p className="text-neutral-400">No Pokémon teams submitted yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
