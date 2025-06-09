import { motion } from "framer-motion";
import { useState } from "react";
import { FiInfo, FiLogOut, FiPlus, FiX } from "react-icons/fi";

type Tournament = {
  id: string;
  name: string;
  format: string;
  totalPlayers: number;
  joinedPlayers: number;
  description: string;
  stages: {
    name: string;
    playersSelected: number;
  }[];
  isParticipating: boolean;
};

type TournamentModalProps = {
  tournament: Tournament | null;
  onClose: () => void;
};

function TournamentModal({ tournament, onClose }: TournamentModalProps) {
  if (!tournament) return null;

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
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{tournament.name}</h2>
            <span className="inline-block border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm">
              {tournament.format}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Tournament Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <p className="text-neutral-400 text-sm">Total Players</p>
                <p className="text-white font-semibold">{tournament.totalPlayers}</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <p className="text-neutral-400 text-sm">Players Joined</p>
                <p className="text-white font-semibold">{tournament.joinedPlayers}</p>
              </div>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <p className="text-neutral-400 text-sm mb-2">Description</p>
              <p className="text-white">{tournament.description}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Tournament Stages</h3>
            <div className="space-y-3">
              {tournament.stages.map((stage, index) => (
                <div key={index} className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{stage.name}</span>
                    <span className="text-neutral-400 text-sm">
                      {stage.playersSelected} players advance
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DashboardJoin() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const tournaments: Tournament[] = [
    {
      id: "summer-championship-2025",
      name: "Summer Championship 2025",
      format: "OU Singles",
      totalPlayers: 32,
      joinedPlayers: 28,
      description:
        "The biggest tournament of the summer! Compete in OU Singles format with cash prizes for top finishers. Registration closes when we reach 32 players.",
      stages: [
        { name: "Round 1", playersSelected: 16 },
        { name: "Round 2", playersSelected: 8 },
        { name: "Semifinals", playersSelected: 4 },
        { name: "Finals", playersSelected: 2 },
        { name: "Champion", playersSelected: 1 },
      ],
      isParticipating: true,
    },
    {
      id: "vgc-monthly-dec",
      name: "VGC Monthly - December",
      format: "VGC Doubles",
      totalPlayers: 16,
      joinedPlayers: 12,
      description:
        "Monthly VGC tournament featuring the latest regulation set. Perfect for practicing your doubles skills!",
      stages: [
        { name: "Swiss Rounds", playersSelected: 8 },
        { name: "Top 8", playersSelected: 4 },
        { name: "Semifinals", playersSelected: 2 },
        { name: "Finals", playersSelected: 1 },
      ],
      isParticipating: false,
    },
    {
      id: "beginners-cup",
      name: "Beginners Cup",
      format: "OU Singles",
      totalPlayers: 24,
      joinedPlayers: 15,
      description:
        "A tournament designed for newer players to get comfortable with competitive play. Friendly atmosphere with coaching tips!",
      stages: [
        { name: "Group Stage", playersSelected: 12 },
        { name: "Elimination", playersSelected: 6 },
        { name: "Semifinals", playersSelected: 3 },
        { name: "Finals", playersSelected: 1 },
      ],
      isParticipating: false,
    },
    {
      id: "winter-showdown",
      name: "Winter Showdown",
      format: "Anything Goes",
      totalPlayers: 64,
      joinedPlayers: 45,
      description:
        "No holds barred tournament! Anything Goes format means bring your strongest team and prepare for chaos.",
      stages: [
        { name: "Preliminary", playersSelected: 32 },
        { name: "Round 1", playersSelected: 16 },
        { name: "Round 2", playersSelected: 8 },
        { name: "Quarterfinals", playersSelected: 4 },
        { name: "Semifinals", playersSelected: 2 },
        { name: "Finals", playersSelected: 1 },
      ],
      isParticipating: false,
    },
  ];

  const handleJoinLeave = (tournamentId: string) => {
    console.log("Join/Leave tournament:", tournamentId);
  };

  const openModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
  };

  const closeModal = () => {
    setSelectedTournament(null);
  };

  return (
    <>
      <div className="space-y-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Join Tournament</h1>
          <p className="text-neutral-400 text-xl">Find and join competitive tournaments</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {tournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border rounded-xl p-6 hover:border-red-500/30 transition-all duration-300 ${
                tournament.isParticipating
                  ? "border-red-500/50 ring-1 ring-red-500/20"
                  : "border-neutral-700/50"
              }`}
            >
              {tournament.isParticipating && (
                <div className="flex justify-end mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    Participating
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                  <span className="inline-block border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm">
                    {tournament.format}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-800/30 rounded-lg p-3">
                    <p className="text-neutral-400 text-sm">Total Players</p>
                    <p className="text-white font-semibold">{tournament.totalPlayers}</p>
                  </div>
                  <div className="bg-neutral-800/30 rounded-lg p-3">
                    <p className="text-neutral-400 text-sm">Players Joined</p>
                    <p className="text-white font-semibold">{tournament.joinedPlayers}</p>
                  </div>
                </div>

                <div className="w-full bg-neutral-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(tournament.joinedPlayers / tournament.totalPlayers) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleJoinLeave(tournament.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      tournament.isParticipating
                        ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400"
                        : "bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400"
                    }`}
                  >
                    {tournament.isParticipating ? (
                      <>
                        <FiLogOut className="w-4 h-4" />
                        Leave
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4" />
                        Join
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openModal(tournament)}
                    className="p-3 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 hover:border-neutral-600 rounded-lg text-neutral-400 hover:text-white transition-all duration-200"
                  >
                    <FiInfo className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {selectedTournament && (
        <TournamentModal tournament={selectedTournament} onClose={closeModal} />
      )}
    </>
  );
}
