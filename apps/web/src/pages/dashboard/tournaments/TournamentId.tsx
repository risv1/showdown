/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { AddMatchModal } from "../../../components/dashboard/AddMatchModal";
import { EndModal } from "../../../components/dashboard/EndModal";
import { TournamentLeaderboard } from "../../../components/dashboard/Leaderboard";
import { MatchModal } from "../../../components/dashboard/MatchModal";
import { TournamentNotStartedOverlay } from "../../../components/dashboard/NotStartedOverlay";
import { PlayerModal } from "../../../components/dashboard/PlayerModal";
import { Podium } from "../../../components/dashboard/Podium";
import { TournamentStages } from "../../../components/dashboard/Stages";
import { TournamentBracket } from "../../../components/dashboard/TournamentBracket";
import { useTournaments } from "../../../hooks/tournaments";
import type { Match, Player, Stage, Tournament } from "../../../types/tournament";
import { API } from "../../../utils/constants";

export default function TournamentId() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [tournamentBasic, setTournamentBasic] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const [basicLoading, setBasicLoading] = useState(true);
  const [stagesLoading, setStagesLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(true);

  const [refreshingBasic, setRefreshingBasic] = useState(false);
  const [refreshingStages, setRefreshingStages] = useState(false);
  const [refreshingPlayers, setRefreshingPlayers] = useState(false);
  const [refreshingMatches, setRefreshingMatches] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [addMatchStage, setAddMatchStage] = useState<Stage | null>(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    startTournament,
    isLoading: actionLoading,
    endTournament,
    updateStageStatus,
  } = useTournaments();

  const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    if (token) return token;

    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "token" || name === "authToken") {
        return value;
      }
    }

    return null;
  };

  const fetchTournamentBasic = async (refresh = false) => {
    if (!id) return;

    try {
      if (refresh) {
        setRefreshingBasic(true);
      } else {
        setBasicLoading(true);
      }

      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      const url = new URL(
        API.BASE_URL +
          API.ENDPOINTS.TOURNAMENTS.BASE_URL() +
          API.ENDPOINTS.TOURNAMENTS.GET_BASIC(id)
      );

      if (refresh) {
        url.searchParams.set("refresh", "true");
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/auth/login");
          return;
        }
        throw new Error(`Failed to fetch tournament basic info: ${response.status}`);
      }

      const data = await response.json();
      setTournamentBasic(data.tournament);
      return data.tournament;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (refresh) {
        setRefreshingBasic(false);
      } else {
        setBasicLoading(false);
      }
    }
  };

  const fetchTournamentStages = async (refresh = false) => {
    if (!id) return;

    try {
      if (refresh) {
        setRefreshingStages(true);
      } else {
        setStagesLoading(true);
      }

      const token = getAuthToken();
      if (!token) return;

      const url = new URL(
        API.BASE_URL +
          API.ENDPOINTS.TOURNAMENTS.BASE_URL() +
          API.ENDPOINTS.TOURNAMENTS.GET_STAGES(id)
      );

      if (refresh) {
        url.searchParams.set("refresh", "true");
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStages(data.stages);
        return data.stages;
      }
    } catch (err) {
      console.error("Failed to fetch stages:", err);
    } finally {
      if (refresh) {
        setRefreshingStages(false);
      } else {
        setStagesLoading(false);
      }
    }
  };

  const fetchTournamentPlayers = async (refresh = false) => {
    if (!id) return;

    try {
      if (refresh) {
        setRefreshingPlayers(true);
      } else {
        setPlayersLoading(true);
      }

      const token = getAuthToken();
      if (!token) return;

      const url = new URL(
        API.BASE_URL +
          API.ENDPOINTS.TOURNAMENTS.BASE_URL() +
          API.ENDPOINTS.TOURNAMENTS.GET_PLAYERS(id)
      );

      if (refresh) {
        url.searchParams.set("refresh", "true");
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players);
        return data.players;
      }
    } catch (err) {
      console.error("Failed to fetch players:", err);
    } finally {
      if (refresh) {
        setRefreshingPlayers(false);
      } else {
        setPlayersLoading(false);
      }
    }
  };

  const fetchTournamentMatches = async (refresh = false) => {
    if (!id) return;

    try {
      if (refresh) {
        setRefreshingMatches(true);
      }

      const token = getAuthToken();
      if (!token) return;

      const url = new URL(
        API.BASE_URL +
          API.ENDPOINTS.MATCHES.BASE_URL() +
          API.ENDPOINTS.MATCHES.GET_TOURNAMENT_MATCHES(id)
      );

      if (refresh) {
        url.searchParams.set("refresh", "true");
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches);
        return data.matches;
      }
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      if (refresh) {
        setRefreshingMatches(false);
      }
    }
  };

  const handleRefreshBasic = () => fetchTournamentBasic(true);
  const handleRefreshStages = () => fetchTournamentStages(true);
  const handleRefreshPlayers = () => fetchTournamentPlayers(true);
  const handleRefreshMatches = () => fetchTournamentMatches(true);

  useEffect(() => {
    if (tournamentBasic) {
      setTournament({
        ...tournamentBasic,
        stages,
        players,
        matches,
      });
    }
  }, [tournamentBasic, stages, players, matches]);

  useEffect(() => {
    if (id) {
      fetchTournamentBasic();
      fetchTournamentStages();
      fetchTournamentPlayers();
      fetchTournamentMatches();
    }
  }, [id]);

  const handleStartTournament = async () => {
    if (!tournament) return;

    try {
      await startTournament(String(tournament.id));
      const updatedBasic = await fetchTournamentBasic();
      if (updatedBasic) {
        setTournamentBasic(updatedBasic);
      }
    } catch (error) {
      console.error("Failed to start tournament:", error);
    }
  };

  const handleEndTournament = async () => {
    if (!tournament) return;

    try {
      await endTournament(String(tournament.id));
      const updatedBasic = await fetchTournamentBasic();
      if (updatedBasic) {
        setTournamentBasic(updatedBasic);
      }
      setShowEndConfirmation(false);
    } catch (error) {
      console.error("Failed to end tournament:", error);
    }
  };

  const handleAddMatch = async (
    stageId: number,
    data: { replayUrl: string; pointsWon?: number }
  ) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        API.BASE_URL +
          API.ENDPOINTS.MATCHES.BASE_URL() +
          API.ENDPOINTS.MATCHES.CREATE(String(tournament?.id), String(stageId)),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create match");
      }

      await Promise.all([fetchTournamentMatches(), fetchTournamentPlayers()]);

      setAddMatchStage(null);
    } catch (error) {
      console.error("Failed to add match:", error);
    }
  };

  const handleUpdateMatch = async (
    matchId: number,
    data: { winnerId: number; loserId: number; pointsWon: number; replayUrl: string }
  ) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        API.BASE_URL +
          API.ENDPOINTS.MATCHES.BASE_URL() +
          API.ENDPOINTS.MATCHES.UPDATE(String(matchId)),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update match");
      }

      await Promise.all([fetchTournamentMatches(), fetchTournamentPlayers()]);

      setSelectedMatch(null);
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

  const handleUpdateStageStatus = async (stageId: number, started: boolean) => {
    if (!tournament) return;

    try {
      await updateStageStatus(String(tournament.id), stageId, started);
      await fetchTournamentStages();
    } catch (error) {
      console.error("Failed to update stage status:", error);
    }
  };

  const isLoading = basicLoading || !tournament;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-lg"
        >
          Loading tournament details...
        </motion.div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-lg"
        >
          {error || "Tournament not found"}
        </motion.div>
      </div>
    );
  }

  const RefreshButton = ({
    isRefreshing,
    onRefresh,
    className = "",
  }: {
    isRefreshing: boolean;
    onRefresh: () => void;
    className?: string;
  }) => (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className={`p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Refresh data"
    >
      <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </button>
  );

  const SkeletonText = ({ className }: { className?: string }) => (
    <div
      className={`bg-gradient-to-r from-neutral-800 to-neutral-900 rounded animate-pulse ${className}`}
    />
  );

  const TournamentInfoSkeleton = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6 }}
      className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 sm:p-6"
    >
      <div className="animate-pulse">
        <SkeletonText className="h-6 w-48 mb-4" />
        <SkeletonText className="h-4 w-full mb-2" />
        <SkeletonText className="h-4 w-5/6 mb-2" />
        <SkeletonText className="h-4 w-3/4" />
      </div>
    </motion.div>
  );

  const LeaderboardSkeleton = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 sm:p-6"
    >
      <div className="animate-pulse">
        <SkeletonText className="h-6 w-32 mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-neutral-800/30 rounded-lg">
              <SkeletonText className="h-6 w-6 rounded" />
              <SkeletonText className="h-5 w-24" />
              <div className="ml-auto flex gap-4">
                <SkeletonText className="h-4 w-8" />
                <SkeletonText className="h-4 w-8" />
                <SkeletonText className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const StagesSkeleton = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 sm:p-6"
    >
      <div className="animate-pulse">
        <SkeletonText className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-neutral-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <SkeletonText className="h-5 w-32" />
                <SkeletonText className="h-4 w-20" />
              </div>
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex items-center gap-4 p-3 bg-neutral-800/30 rounded-lg">
                    <SkeletonText className="h-4 w-24" />
                    <SkeletonText className="h-4 w-16" />
                    <div className="ml-auto">
                      <SkeletonText className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto relative px-4 sm:px-6 lg:px-0">
        {!tournament.isStarted && (
          <TournamentNotStartedOverlay
            tournament={tournament}
            onStartTournament={handleStartTournament}
            actionLoading={actionLoading}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-shrink-0 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors mt-1"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">
                {tournament.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="border border-red-500/30 text-red-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                  {tournament.format}
                </span>
                <span className="text-neutral-400 text-xs sm:text-sm whitespace-nowrap">
                  {tournament.currentPlayers}/{tournament.maxPlayers} players
                </span>
                {tournament.isCreator && (
                  <span className="border border-blue-500/30 text-blue-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                    Creator
                  </span>
                )}
                {tournament.isEnded && (
                  <span className="border border-green-500/30 text-green-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                    Ended
                  </span>
                )}
              </div>
            </div>
          </div>

          {tournament.isCreator && tournament.isStarted && !tournament.isEnded && (
            <button
              onClick={() => setShowEndConfirmation(true)}
              disabled={actionLoading}
              className="flex gap-3 items-center w-fit sm:w-auto border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              End Tournament
            </button>
          )}
        </motion.div>

        {basicLoading ? (
          <TournamentInfoSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Tournament Information</h2>
              <RefreshButton isRefreshing={refreshingBasic} onRefresh={handleRefreshBasic} />
            </div>
            <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
              {tournament.description}
            </p>
          </motion.div>
        )}

        {playersLoading ? (
          <LeaderboardSkeleton />
        ) : tournament.isEnded ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Final Results</h2>
              <RefreshButton isRefreshing={refreshingPlayers} onRefresh={handleRefreshPlayers} />
            </div>
            <Podium players={tournament.players} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Leaderboard</h2>
              <RefreshButton isRefreshing={refreshingPlayers} onRefresh={handleRefreshPlayers} />
            </div>
            <TournamentLeaderboard players={tournament.players} onPlayerClick={setSelectedPlayer} />
          </motion.div>
        )}

        {tournament.isEnded && tournament.matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Tournament Bracket</h2>
              <RefreshButton isRefreshing={refreshingMatches} onRefresh={handleRefreshMatches} />
            </div>
            <TournamentBracket
              stages={tournament.stages}
              matches={tournament.matches}
              players={tournament.players}
              tournamentName={tournament.name}
            />
          </motion.div>
        )}

        {!tournament.isEnded &&
          (stagesLoading ? (
            <StagesSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">Tournament Stages</h2>
                <RefreshButton isRefreshing={refreshingStages} onRefresh={handleRefreshStages} />
              </div>
              <TournamentStages
                isLoading={stagesLoading}
                tournament={tournament}
                onAddMatch={setAddMatchStage}
                onMatchClick={setSelectedMatch}
                onTeamUpdate={fetchTournamentPlayers}
                onUpdateStageStatus={handleUpdateStageStatus}
              />
            </motion.div>
          ))}
      </div>

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          tournamentStages={tournament.stages}
        />
      )}

      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          players={tournament.players}
          onClose={() => setSelectedMatch(null)}
          onUpdate={tournament.isCreator && !tournament.isEnded ? handleUpdateMatch : undefined}
        />
      )}

      {addMatchStage && (
        <AddMatchModal
          stage={addMatchStage}
          onClose={() => setAddMatchStage(null)}
          onAddMatch={handleAddMatch}
        />
      )}

      <EndModal
        isOpen={showEndConfirmation}
        onClose={() => setShowEndConfirmation(false)}
        onConfirm={handleEndTournament}
        title="End Tournament"
        message="Are you sure you want to end this tournament? This action cannot be undone and will finalize all results."
        confirmText="End Tournament"
        isLoading={actionLoading}
      />
    </>
  );
}
