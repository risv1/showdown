import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { FiDownload } from "react-icons/fi";
import type { Match, Player, Stage } from "../../types/tournament";

interface TournamentBracketProps {
  stages: Stage[];
  matches: Match[];
  players: Player[];
  tournamentName: string;
}

export function TournamentBracket({
  stages,
  matches,
  players,
  tournamentName,
}: TournamentBracketProps) {
  const bracketRef = useRef<HTMLDivElement>(null);

  const getPlayerName = (playerId: number) => {
    const player = players.find((p) => p.id === playerId);
    return player?.username || "Unknown";
  };

  const getMatchesByStage = (stageId: number) => {
    return matches.filter((match) => match.stageId === stageId);
  };

  const downloadBracket = async () => {
    if (!bracketRef.current) return;

    try {
      const canvas = await html2canvas(bracketRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${tournamentName.replace(/\s+/g, "_")}_bracket.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Failed to download bracket:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Tournament Bracket</h2>
        <button
          onClick={downloadBracket}
          className="flex items-center gap-3 border border-red-600 hover:border-red-500 text-red-500 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload className="w-4 h-4" />
          Download Bracket
        </button>
      </div>

      <div
        ref={bracketRef}
        className="overflow-x-auto bg-neutral-900 p-6 rounded-lg"
        style={{ minWidth: "fit-content" }}
      >
        <div className="flex gap-8">
          {stages.map((stage, stageIndex) => {
            const stageMatches = getMatchesByStage(stage.id);

            return (
              <div key={stage.id} className="flex flex-col">
                <h3 className="text-white font-semibold mb-4 text-center">{stage.name}</h3>

                <div className="flex flex-col gap-4">
                  {stageMatches.map((match, matchIndex) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: stageIndex * 0.1 + matchIndex * 0.05 }}
                      className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 min-w-48"
                    >
                      <div className="space-y-2">
                        <div
                          className={`flex items-center justify-between p-2 rounded ${
                            match.winnerId === match.player1Id
                              ? "bg-green-900/30 border border-green-700/50"
                              : match.winnerId === match.player2Id
                              ? "bg-red-900/30 border border-red-700/50"
                              : "bg-neutral-700/50"
                          }`}
                        >
                          <span
                            className={`text-sm ${
                              match.winnerId === match.player1Id
                                ? "text-green-300 font-semibold"
                                : "text-neutral-300"
                            }`}
                          >
                            {getPlayerName(match.player1Id)}
                          </span>
                          {match.winnerId === match.player1Id && (
                            <span className="text-green-400 text-xs">W</span>
                          )}
                        </div>

                        <div
                          className={`flex items-center justify-between p-2 rounded ${
                            match.winnerId === match.player2Id
                              ? "bg-green-900/30 border border-green-700/50"
                              : match.winnerId === match.player1Id
                              ? "bg-red-900/30 border border-red-700/50"
                              : "bg-neutral-700/50"
                          }`}
                        >
                          <span
                            className={`text-sm ${
                              match.winnerId === match.player2Id
                                ? "text-green-300 font-semibold"
                                : "text-neutral-300"
                            }`}
                          >
                            {getPlayerName(match.player2Id)}
                          </span>
                          {match.winnerId === match.player2Id && (
                            <span className="text-green-400 text-xs">W</span>
                          )}
                        </div>
                      </div>

                      {match.winnerId && (
                        <div className="mt-2 pt-2 border-t border-neutral-600">
                          <p className="text-xs text-neutral-400">Points: {match.pointsWon || 0}</p>
                          {match.replayUrl && (
                            <a
                              href={match.replayUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              View Replay
                            </a>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
