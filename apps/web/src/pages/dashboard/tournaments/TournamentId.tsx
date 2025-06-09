import { motion } from "framer-motion";
import { useState } from "react";
import { BiTrophy } from "react-icons/bi";
import { FiArrowLeft, FiInfo, FiPlus, FiUser, FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

interface Player {
  id: string;
  username: string;
  email: string;
  joinDate: number;
  wins: number;
  losses: number;
  points: number;
  rank: number;
  pokemon: string[];
}

interface Match {
  id: string;
  player1: string;
  player2: string;
  winner: string;
  loser: string;
  pointsWon: number;
  replay: string;
  player1Pokemon: string[];
  player2Pokemon: string[];
}

interface Stage {
  id: string;
  name: string;
  isActive: boolean;
  matches: Match[];
}

interface Tournament {
  id: string;
  name: string;
  format: string;
  description: string;
  totalPlayers: number;
  rounds: number;
  currentStage: string;
  stages: Stage[];
  players: Player[];
}

interface PlayerModalProps {
  player: Player | null;
  onClose: () => void;
}

interface MatchModalProps {
  match: Match | null;
  onClose: () => void;
}

interface AddMatchModalProps {
  stage: Stage | null;
  onClose: () => void;
  onAddMatch: (stageId: string, replay: string) => void;
}

function PlayerModal({ player, onClose }: PlayerModalProps) {
  if (!player) return null;

  const formatPokemonName = (pokemonName: string) => {
    return pokemonName.toLowerCase().replace(/\s+/g, "");
  };

  const capitalizeName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Pokémon Team</h3>
            <div className="grid grid-cols-6 gap-4">
              {player.pokemon.map((pokemon, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 relative border border-neutral-700/50 rounded-lg p-1">
                    <img
                      src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen7x/regular/${formatPokemonName(
                        pokemon
                      )}.png`}
                      alt={pokemon}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-xs text-neutral-400">{capitalizeName(pokemon)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MatchModal({ match, onClose }: MatchModalProps) {
  if (!match) return null;

  const formatPokemonName = (pokemonName: string) => {
    return pokemonName.toLowerCase().replace(/\s+/g, "");
  };

  const capitalizeName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
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
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Match Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-800/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-lg font-semibold text-white">{match.player1}</p>
                <p className="text-sm text-neutral-400">Player 1</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">VS</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">{match.player2}</p>
                <p className="text-sm text-neutral-400">Player 2</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <p className="text-neutral-400 text-sm">Winner</p>
              <p className="text-white font-semibold">{match.winner}</p>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <p className="text-neutral-400 text-sm">Points Won</p>
              <p className="text-white font-semibold">{match.pointsWon}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Pokémon Used</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-white mb-3">{match.player1}</h4>
                <div className="grid grid-cols-6 gap-2">
                  {match.player1Pokemon.map((pokemon, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-1 border border-neutral-700/50 rounded p-1">
                        <img
                          src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen7x/regular/${formatPokemonName(
                            pokemon
                          )}.png`}
                          alt={pokemon}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <p className="text-xs text-neutral-400">{capitalizeName(pokemon)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-md font-medium text-white mb-3">{match.player2}</h4>
                <div className="grid grid-cols-6 gap-2">
                  {match.player2Pokemon.map((pokemon, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-1 border border-neutral-700/50 rounded p-1">
                        <img
                          src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen7x/regular/${formatPokemonName(
                            pokemon
                          )}.png`}
                          alt={pokemon}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <p className="text-xs text-neutral-400">{capitalizeName(pokemon)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 rounded-lg p-4">
            <p className="text-neutral-400 text-sm mb-2">Match Replay</p>
            <a
              href={match.replay}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline break-all"
            >
              {match.replay}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddMatchModal({ stage, onClose, onAddMatch }: AddMatchModalProps) {
  const [replay, setReplay] = useState("");

  if (!stage) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replay.trim()) {
      onAddMatch(stage.id, replay.trim());
      onClose();
      setReplay("");
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
        className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 max-w-lg w-full"
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Match to {stage.name}</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Match Replay URL</label>
            <input
              type="url"
              value={replay}
              onChange={(e) => setReplay(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-500"
              placeholder="https://replay.pokemonshowdown.com/..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Add Match
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function TournamentId() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const currentUser = "zarel";

  const tournament: Tournament = {
    id: id || "",
    name: "Summer Championship 2025",
    format: "OU Singles",
    description:
      "The biggest tournament of the summer! Compete in OU Singles format with cash prizes for top finishers. This tournament features multiple elimination rounds with the best players advancing through each stage.",
    totalPlayers: 32,
    rounds: 5,
    currentStage: "round-2",
    stages: [
      {
        id: "round-1",
        name: "Round 1",
        isActive: false,
        matches: [
          {
            id: "match-1",
            player1: "zarel",
            player2: "player2",
            winner: "zarel",
            loser: "player2",
            pointsWon: 3,
            replay: "https://replay.pokemonshowdown.com/gen9ou-123456",
            player1Pokemon: [
              "pikachu",
              "charizard",
              "blastoise",
              "venusaur",
              "dragonite",
              "mewtwo",
            ],
            player2Pokemon: ["alakazam", "gengar", "machamp", "golem", "lapras", "snorlax"],
          },
        ],
      },
      {
        id: "round-2",
        name: "Round 2",
        isActive: true,
        matches: [
          {
            id: "match-2",
            player1: "zarel",
            player2: "player3",
            winner: "zarel",
            loser: "player3",
            pointsWon: 2,
            replay: "https://replay.pokemonshowdown.com/gen9ou-789012",
            player1Pokemon: [
              "pikachu",
              "charizard",
              "blastoise",
              "venusaur",
              "dragonite",
              "mewtwo",
            ],
            player2Pokemon: ["tyranitar", "salamence", "garchomp", "lucario", "magnezone", "rotom"],
          },
        ],
      },
      {
        id: "semifinals",
        name: "Semifinals",
        isActive: false,
        matches: [],
      },
      {
        id: "finals",
        name: "Finals",
        isActive: false,
        matches: [],
      },
    ],
    players: [
      {
        id: "zarel",
        username: "zarel",
        email: "zarel@showdown.com",
        joinDate: 1609459200,
        wins: 12,
        losses: 3,
        points: 36,
        rank: 1,
        pokemon: [
          "pikachu",
          "charizard",
          "blastoise",
          "venusaur",
          "dragonite",
          "mewtwo",
          "chansey",
        ],
      },
      {
        id: "player2",
        username: "player2",
        email: "player2@showdown.com",
        joinDate: 1609545600,
        wins: 10,
        losses: 5,
        points: 30,
        rank: 2,
        pokemon: ["alakazam", "gengar", "machamp", "golem", "lapras", "snorlax"],
      },
      {
        id: "player3",
        username: "player3",
        email: "player3@showdown.com",
        joinDate: 1609632000,
        wins: 8,
        losses: 7,
        points: 24,
        rank: 3,
        pokemon: ["tyranitar", "salamence", "garchomp", "lucario", "magnezone", "rotom"],
      },
    ],
  };

  const handleAddMatch = (stageId: string, replay: string) => {
    console.log(`Adding match to stage ${stageId} with replay: ${replay}`);
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <>
      <div className="space-y-8 max-w-6xl mx-auto">
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
                  {tournament.totalPlayers} players • {tournament.rounds} rounds
                </span>
              </div>
            </div>
          </div>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-neutral-700/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BiTrophy className="w-5 h-5 text-red-400" />
              Leaderboard
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-400">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-neutral-400">
                    Player
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-neutral-400">
                    Wins
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-neutral-400">
                    Losses
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-neutral-400">
                    Points
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/50">
                {tournament.players.map((player) => (
                  <tr
                    key={player.id}
                    className={`hover:bg-neutral-800/30 transition-colors ${
                      player.username === currentUser
                        ? "border-2 border-red-500/50 border-dashed bg-red-500/5"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm">
                      <span className="text-white font-semibold text-lg">
                        {getRankDisplay(player.rank)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{player.username}</p>
                          <p className="text-xs text-neutral-400">{player.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-white font-semibold">
                      {player.wins}
                    </td>
                    <td className="px-6 py-4 text-center text-white font-semibold">
                      {player.losses}
                    </td>
                    <td className="px-6 py-4 text-center text-white font-semibold">
                      {player.points}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedPlayer(player)}
                        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                      >
                        <FiInfo className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">Tournament Stages</h2>

          {tournament.stages.map((stage) => (
            <div
              key={stage.id}
              className={`bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border rounded-xl p-6 ${
                stage.isActive
                  ? "border-red-500/50 ring-1 ring-red-500/20"
                  : "border-neutral-700/50"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">{stage.name}</h3>
                  {stage.isActive && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedStage(stage)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Match
                </button>
              </div>

              {stage.matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stage.matches.map((match) => (
                    <div
                      key={match.id}
                      className="bg-neutral-800/50 rounded-lg p-4 hover:bg-neutral-800/70 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-center flex-1">
                          <p className="text-white font-medium">{match.player1}</p>
                        </div>
                        <div className="px-3">
                          <p className="text-red-400 font-bold">VS</p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-white font-medium">{match.player2}</p>
                        </div>
                      </div>

                      <div className="text-center mb-3">
                        <p className="text-sm text-neutral-400">Winner:</p>
                        <p className="text-white font-semibold">{match.winner}</p>
                        <p className="text-xs text-neutral-400">{match.pointsWon} points</p>
                      </div>

                      <button
                        onClick={() => setSelectedMatch(match)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 border border-neutral-600 hover:border-neutral-500 rounded-lg text-neutral-300 hover:text-white transition-all duration-200 text-sm"
                      >
                        <FiInfo className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-400">No matches in this stage yet</p>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
      {selectedMatch && <MatchModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
      {selectedStage && (
        <AddMatchModal
          stage={selectedStage}
          onClose={() => setSelectedStage(null)}
          onAddMatch={handleAddMatch}
        />
      )}
    </>
  );
}
