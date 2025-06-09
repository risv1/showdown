import { motion } from "framer-motion";
import { useState } from "react";
import { FiCheck, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";
import { useTournaments } from "../../hooks/tournaments";

interface Stage {
  id: string;
  name: string;
  playersSelected: number;
}

export default function DashboardCreate() {
  const [formData, setFormData] = useState({
    tournamentName: "",
    totalPlayers: 16,
    format: "",
    description: "",
  });

  const [stages, setStages] = useState<Stage[]>([{ id: "1", name: "Round 1", playersSelected: 8 }]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { createTournament, isLoading } = useTournaments();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addStage = () => {
    const newStage: Stage = {
      id: Date.now().toString(),
      name: `Round ${stages.length + 1}`,
      playersSelected: Math.floor(stages[stages.length - 1]?.playersSelected / 2) || 1,
    };
    setStages((prev) => [...prev, newStage]);
  };

  const removeStage = (id: string) => {
    if (stages.length > 1) {
      setStages((prev) => prev.filter((stage) => stage.id !== id));
    }
  };

  const updateStage = (id: string, field: string, value: string | number) => {
    setStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    try {
      const tournamentData = {
        name: formData.tournamentName,
        format: formData.format,
        description: formData.description,
        maxPlayers: formData.totalPlayers,
        stages: stages.map((stage) => ({
          name: stage.name,
          playersSelected: stage.playersSelected,
        })),
      };

      await createTournament(tournamentData);
      setShowConfirmation(false);

      setFormData({
        tournamentName: "",
        totalPlayers: 16,
        format: "",
        description: "",
      });
      setStages([{ id: "1", name: "Round 1", playersSelected: 8 }]);
    } catch (error) {
      console.error("Failed to create tournament:", error);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Create Tournament</h1>
        <p className="text-neutral-400 text-xl">Set up a new competitive tournament</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tournament Name</label>
              <input
                type="text"
                value={formData.tournamentName}
                onChange={(e) => handleInputChange("tournamentName", e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:border-red-500/50 focus:outline-none transition-colors"
                placeholder="Enter tournament name"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Total Players</label>
              <input
                type="number"
                value={formData.totalPlayers}
                onChange={(e) => handleInputChange("totalPlayers", parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:border-red-500/50 focus:outline-none transition-colors"
                min="2"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Format</label>
            <input
              type="text"
              value={formData.format}
              onChange={(e) => handleInputChange("format", e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:border-red-500/50 focus:outline-none transition-colors"
              placeholder="e.g., OU Singles, VGC Doubles, etc."
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:border-red-500/50 focus:outline-none transition-colors resize-none"
              rows={4}
              placeholder="Describe your tournament rules, prizes, and other details..."
              disabled={isLoading}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Tournament Stages</h3>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addStage}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FiPlus className="w-4 h-4" />
                Add Stage
              </motion.button>
            </div>

            <div className="space-y-4">
              {stages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-neutral-800/30 border border-neutral-700/50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={stage.name}
                        onChange={(e) => updateStage(stage.id, "name", e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:border-red-500/50 focus:outline-none transition-colors"
                        placeholder="Stage name"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="w-48">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-400 whitespace-nowrap">
                          Players selected:
                        </span>
                        <input
                          type="number"
                          value={stage.playersSelected}
                          onChange={(e) =>
                            updateStage(stage.id, "playersSelected", parseInt(e.target.value))
                          }
                          className="w-20 px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:border-red-500/50 focus:outline-none transition-colors"
                          min="1"
                          max={formData.totalPlayers}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    {stages.length > 1 && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeStage(stage.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <motion.button
              type="submit"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="flex items-center gap-3 px-8 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-xl text-red-400 hover:text-red-300 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <FiSave className="w-5 h-5" />
              {isLoading ? "Creating..." : "Create Tournament"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed w-screen h-screen inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 "
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700/50 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Tournament Creation</h3>
            <div className="space-y-2 text-neutral-300 mb-6">
              <p>
                <span className="text-neutral-400">Name:</span> {formData.tournamentName}
              </p>
              <p>
                <span className="text-neutral-400">Players:</span> {formData.totalPlayers}
              </p>
              <p>
                <span className="text-neutral-400">Format:</span> {formData.format}
              </p>
              <p>
                <span className="text-neutral-400">Stages:</span> {stages.length}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={cancelSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FiX className="w-4 h-4" />
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                onClick={confirmSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FiCheck className="w-4 h-4" />
                {isLoading ? "Creating..." : "Confirm"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
