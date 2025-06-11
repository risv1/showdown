import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiEdit,
  FiExternalLink,
  FiPlus,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { usePokemon } from "../../hooks/pokemon";
import { SettingsModal } from "./SettingsModal";
import { StageTeamManager } from "./StageTeamManager";

import type { Match, Stage, Tournament } from "../../types/tournament";

interface TournamentStagesProps {
  tournament: Tournament;
  onAddMatch: (stage: Stage) => void;
  onMatchClick: (match: Match) => void;
  onTeamUpdate: () => void;
  onUpdateStageStatus: (stageId: number, started: boolean) => Promise<void>;
  isLoading: boolean;
}

export function TournamentStages({
  tournament,
  onAddMatch,
  onMatchClick,
  onTeamUpdate,
  onUpdateStageStatus,
  isLoading,
}: TournamentStagesProps) {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(
    new Set(tournament.stages.filter((stage) => stage.stageStarted).map((stage) => stage.id))
  );
  const { formatForDisplay } = usePokemon();

  const getMatchesForStage = (stageId: number) => {
    return tournament.matches.filter((match) => match.stageId === stageId);
  };

  const handleStageTeamSubmit = () => {
    setSelectedStage(null);
    onTeamUpdate();
  };

  const getCurrentUserStageTeam = (stageId: number) => {
    const currentUser = tournament.players.find((player) => player.isCurrentUser);
    if (!currentUser || !currentUser.stageTeams) return [];
    return currentUser.stageTeams[stageId] || [];
  };

  const hasTeamForStage = (stageId: number) => {
    const stageTeam = getCurrentUserStageTeam(stageId);
    return stageTeam.length > 0;
  };

  const handleSettingsUpdate = async (stageId: number, started: boolean) => {
    await onUpdateStageStatus(stageId, started);
    onTeamUpdate();
  };

  const toggleStageExpansion = (stageId: number) => {
    setExpandedStages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="space-y-4 sm:space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Tournament Stages</h2>

          {tournament.isCreator && tournament.isStarted && !tournament.isEnded && (
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-500 rounded-lg text-blue-400 hover:text-blue-300 transition-all text-sm"
            >
              <FiSettings className="w-4 h-4" />
              Settings
            </button>
          )}
        </div>

        {tournament.stages.map((stage) => {
          const stageMatches = getMatchesForStage(stage.id);
          const hasTeamSubmitted = hasTeamForStage(stage.id);
          const stageTeam = getCurrentUserStageTeam(stage.id);
          const isExpanded = expandedStages.has(stage.id);

          return (
            <div
              key={stage.id}
              className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl overflow-hidden"
            >
              {/* Accordion Header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 cursor-pointer hover:bg-neutral-800/30 transition-colors"
                onClick={() => toggleStageExpansion(stage.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <FiChevronDown className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <FiChevronRight className="w-4 h-4 text-neutral-400" />
                    )}
                    <h3 className="text-lg sm:text-xl font-semibold text-white">{stage.name}</h3>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stage.stageStarted
                        ? "bg-green-500/20 text-green-400 border border-green-500/50"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/50"
                    }`}
                  >
                    {stage.stageStarted ? "Active" : "Not Started"}
                  </span>
                </div>
                <p className="text-neutral-400 text-sm mt-1 sm:mt-0">
                  {stage.playersSelected} players advance
                </p>
              </div>

              {/* Accordion Content */}
              <motion.div
                initial={false}
                animate={{
                  height: isExpanded ? "auto" : 0,
                  opacity: isExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {tournament.isStarted && stage.stageStarted && (
                      <>
                        {hasTeamSubmitted ? (
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {stageTeam.slice(0, 3).map((pokemon, index) => (
                                <div key={index} className="w-6 h-6 sm:w-8 sm:h-8 relative">
                                  <img
                                    src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${pokemon}.png`}
                                    alt={formatForDisplay(pokemon)}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              ))}
                              {stageTeam.length > 3 && (
                                <span className="text-neutral-400 text-xs sm:text-sm">
                                  +{stageTeam.length - 3}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStage(stage);
                              }}
                              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-500 rounded-lg text-blue-400 hover:text-blue-300 transition-all text-xs sm:text-sm"
                            >
                              <FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                              Edit Team
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStage(stage);
                            }}
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 hover:border-green-500 rounded-lg text-green-400 hover:text-green-300 transition-all text-xs sm:text-sm"
                          >
                            <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                            Add Team
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddMatch(stage);
                          }}
                          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-all text-xs sm:text-sm"
                        >
                          <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Match
                        </button>
                      </>
                    )}
                  </div>

                  {/* Matches Grid */}
                  {stageMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                      {stageMatches.map((match) => {
                        const player1 = tournament.players.find((p) => p.id === match.player1Id);
                        const player2 = tournament.players.find((p) => p.id === match.player2Id);
                        const winner = tournament.players.find((p) => p.id === match.winnerId);

                        return (
                          <div
                            key={match.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onMatchClick(match);
                            }}
                            className="bg-neutral-800/30 rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-neutral-800/50 transition-colors border border-neutral-700/30"
                          >
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-neutral-400">Match #{match.id}</span>
                                {match.replayUrl && (
                                  <FiExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                                )}
                              </div>

                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`font-medium text-sm sm:text-base truncate pr-2 ${
                                      match.winnerId === player1?.id
                                        ? "text-green-400"
                                        : "text-white"
                                    }`}
                                  >
                                    {player1?.username}
                                  </span>
                                  {match.winnerId === player1?.id && (
                                    <span className="text-green-400 text-xs sm:text-sm font-medium">
                                      W
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`font-medium text-sm sm:text-base truncate pr-2 ${
                                      match.winnerId === player2?.id
                                        ? "text-green-400"
                                        : "text-white"
                                    }`}
                                  >
                                    {player2?.username}
                                  </span>
                                  {match.winnerId === player2?.id && (
                                    <span className="text-green-400 text-xs sm:text-sm font-medium">
                                      W
                                    </span>
                                  )}
                                </div>
                              </div>

                              {match.winnerId && (
                                <div className="pt-2 border-t border-neutral-700/50">
                                  <p className="text-xs text-neutral-400">
                                    Winner:{" "}
                                    <span className="text-green-400 font-medium">
                                      {winner?.username}
                                    </span>
                                    {match.pointsWon && (
                                      <span className="ml-2">+{match.pointsWon} pts</span>
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-neutral-400 text-sm sm:text-base">
                        {stage.stageStarted
                          ? "No matches yet for this stage"
                          : "Stage not started yet"}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {selectedStage && (
        <StageTeamManager
          tournamentId={tournament.id.toString()}
          stageId={selectedStage.id}
          stageName={selectedStage.name}
          onClose={() => setSelectedStage(null)}
          onTeamSubmit={handleStageTeamSubmit}
        />
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        stages={tournament.stages}
        onUpdateStageStatus={handleSettingsUpdate}
        isLoading={isLoading}
      />
    </>
  );
}
