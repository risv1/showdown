import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [addMatchStage, setAddMatchStage] = useState<Stage | null>(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startTournament, isLoading: actionLoading, endTournament } = useTournaments();

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

  const fetchTournamentDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${
          API.BASE_URL
        }${API.ENDPOINTS.TOURNAMENTS.BASE_URL()}${API.ENDPOINTS.TOURNAMENTS.GET_DETAILS(id)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          navigate("/auth/login");
          return;
        }
        throw new Error(`Failed to fetch tournament details: ${response.status}`);
      }

      const data = await response.json();
      setTournament(data.tournament);
    } catch (err) {
      console.error("Error fetching tournament details:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentDetails();
  }, [id, navigate]);

  const handleStartTournament = async () => {
    if (!tournament) return;

    try {
      await startTournament(String(tournament.id));
      setTournament((prev) => (prev ? { ...prev, isStarted: true } : null));
    } catch (error) {
      console.error("Failed to start tournament:", error);
    }
  };

  const handleEndTournament = async () => {
    if (!tournament) return;

    try {
      await endTournament(String(tournament.id));
      setTournament((prev) => (prev ? { ...prev, isEnded: true } : null));
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
        `${API.BASE_URL}${API.ENDPOINTS.MATCHES.BASE_URL()}${API.ENDPOINTS.MATCHES.CREATE(
          String(tournament?.id),
          String(stageId)
        )}`,
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

      await fetchTournamentDetails();

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
        `${API.BASE_URL}${API.ENDPOINTS.MATCHES.BASE_URL()}${API.ENDPOINTS.MATCHES.UPDATE(
          String(matchId)
        )}`,
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

      await fetchTournamentDetails();

      setSelectedMatch(null);
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

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

  return (
    <>
      <div className="space-y-8 max-w-6xl mx-auto relative">
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
          className="flex items-start justify-between"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{tournament.name}</h1>
              <div className="flex items-center gap-4">
                <span className="border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm">
                  {tournament.format}
                </span>
                <span className="text-neutral-400 text-sm">
                  {tournament.currentPlayers}/{tournament.maxPlayers} players
                </span>
                {tournament.isCreator && (
                  <span className="border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-sm">
                    Creator
                  </span>
                )}
                {tournament.isEnded && (
                  <span className="border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-sm">
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
              className="border border-red-600 hover:border-red-500 text-red-500 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              End Tournament
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Tournament Information</h2>
          <p className="text-neutral-300 leading-relaxed">{tournament.description}</p>
        </motion.div>

        {tournament.isEnded ? (
          <Podium players={tournament.players} />
        ) : (
          <TournamentLeaderboard players={tournament.players} onPlayerClick={setSelectedPlayer} />
        )}

        {tournament.isEnded && tournament.matches.length > 0 && (
          <TournamentBracket
            stages={tournament.stages}
            matches={tournament.matches}
            players={tournament.players}
            tournamentName={tournament.name}
          />
        )}

        {!tournament.isEnded && (
          <TournamentStages
            tournament={tournament}
            onAddMatch={setAddMatchStage}
            onMatchClick={setSelectedMatch}
            onTeamUpdate={() => fetchTournamentDetails()}
          />
        )}
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
