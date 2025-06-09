import { motion } from "framer-motion";
import { useState } from "react";
import { FiEdit, FiExternalLink, FiPlus, FiUsers } from "react-icons/fi";
import { usePokemon } from "../../hooks/pokemon";
import { StageTeamManager } from "./StageTeamManager";

import type { Match, Stage, Tournament } from "../../types/tournament";

interface TournamentStagesProps {
  tournament: Tournament;
  onAddMatch: (stage: Stage) => void;
  onMatchClick: (match: Match) => void;
  onTeamUpdate: () => void;
}

export function TournamentStages({
  tournament,
  onAddMatch,
  onMatchClick,
  onTeamUpdate,
}: TournamentStagesProps) {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-white">Tournament Stages</h2>

        {tournament.stages.map((stage) => {
          const stageMatches = getMatchesForStage(stage.id);
          const hasTeamSubmitted = hasTeamForStage(stage.id);
          const stageTeam = getCurrentUserStageTeam(stage.id);

          return (
            <div
              key={stage.id}
              className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">{stage.name}</h3>
                  <p className="text-neutral-400 text-sm">
                    {stage.playersSelected} players advance
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {tournament.isStarted && (
                    <>
                      {hasTeamSubmitted ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {stageTeam.slice(0, 3).map((pokemon, index) => (
                              <div key={index} className="w-8 h-8 relative">
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
                              <span className="text-neutral-400 text-sm">
                                +{stageTeam.length - 3}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedStage(stage)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-500 rounded-lg text-blue-400 hover:text-blue-300 transition-all"
                          >
                            <FiEdit className="w-4 h-4" />
                            Edit Team
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedStage(stage)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 hover:border-green-500 rounded-lg text-green-400 hover:text-green-300 transition-all"
                        >
                          <FiUsers className="w-4 h-4" />
                          Add Team
                        </button>
                      )}

                      {tournament.isCreator && (
                        <button
                          onClick={() => onAddMatch(stage)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-all"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Match
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {stageMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stageMatches.map((match) => {
                    const player1 = tournament.players.find((p) => p.id === match.player1Id);
                    const player2 = tournament.players.find((p) => p.id === match.player2Id);
                    const winner = tournament.players.find((p) => p.id === match.winnerId);

                    return (
                      <div
                        key={match.id}
                        onClick={() => onMatchClick(match)}
                        className="bg-neutral-800/30 rounded-lg p-4 cursor-pointer hover:bg-neutral-800/50 transition-colors border border-neutral-700/30"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-400">Match #{match.id}</span>
                            {match.replayUrl && <FiExternalLink className="w-4 h-4 text-red-400" />}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-medium ${
                                  match.winnerId === player1?.id ? "text-green-400" : "text-white"
                                }`}
                              >
                                {player1?.username}
                              </span>
                              {match.winnerId === player1?.id && (
                                <span className="text-green-400 text-sm">W</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-medium ${
                                  match.winnerId === player2?.id ? "text-green-400" : "text-white"
                                }`}
                              >
                                {player2?.username}
                              </span>
                              {match.winnerId === player2?.id && (
                                <span className="text-green-400 text-sm">W</span>
                              )}
                            </div>
                          </div>

                          {match.winnerId && (
                            <div className="pt-2 border-t border-neutral-700/50">
                              <p className="text-xs text-neutral-400">
                                Winner: <span className="text-green-400">{winner?.username}</span>
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
                <div className="text-center py-8">
                  <p className="text-neutral-400">No matches yet for this stage</p>
                </div>
              )}
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
    </>
  );
}
