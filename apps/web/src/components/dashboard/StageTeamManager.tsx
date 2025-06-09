import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiEdit, FiPlus, FiSave, FiX } from "react-icons/fi";
import { usePokemon } from "../../hooks/pokemon";
import { useTournaments } from "../../hooks/tournaments";

interface StageTeamManagerProps {
  tournamentId: string;
  stageId: number;
  stageName: string;
  onClose: () => void;
  onTeamSubmit: () => void;
}

const popularPokemon = [
  "Charizard",
  "Blastoise",
  "Venusaur",
  "Pikachu",
  "Alakazam",
  "Machamp",
  "Gengar",
  "Dragonite",
  "Mewtwo",
  "Mew",
  "Typhlosion",
  "Feraligatr",
];

export function StageTeamManager({
  tournamentId,
  stageId,
  stageName,
  onClose,
  onTeamSubmit,
}: StageTeamManagerProps) {
  const [selectedPokemon, setSelectedPokemon] = useState<string[]>([]);
  const [customPokemon, setCustomPokemon] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingTeam, setHasExistingTeam] = useState(false);

  const { submitStageTeam, getStageTeam, isLoading } = useTournaments();
  const { formatForSprite, formatForDisplay, isValidPokemonName } = usePokemon();

  useEffect(() => {
    loadExistingTeam();
  }, [tournamentId, stageId]);

  const loadExistingTeam = async () => {
    try {
      const result = await getStageTeam(tournamentId, stageId);
      if (result.pokemonTeam && result.pokemonTeam.length > 0) {
        setSelectedPokemon(result.pokemonTeam);
        setHasExistingTeam(true);
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Failed to load existing team:", error);
      setIsEditing(true);
    }
  };

  const handleSubmitTeam = async () => {
    if (selectedPokemon.length === 0) return;

    try {
      await submitStageTeam(tournamentId, stageId, selectedPokemon);
      setHasExistingTeam(true);
      setIsEditing(false);
      onTeamSubmit();
    } catch (error) {
      console.error("Failed to submit team:", error);
    }
  };

  const addPokemon = (pokemon: string) => {
    const formattedName = formatForSprite(pokemon);
    if (!selectedPokemon.includes(formattedName)) {
      setSelectedPokemon([...selectedPokemon, formattedName]);
    }
  };

  const addCustomPokemon = () => {
    if (customPokemon.trim() && isValidPokemonName(customPokemon)) {
      const formattedName = formatForSprite(customPokemon.trim());
      if (!selectedPokemon.includes(formattedName)) {
        setSelectedPokemon([...selectedPokemon, formattedName]);
        setCustomPokemon("");
      }
    }
  };

  const removePokemon = (pokemon: string) => {
    setSelectedPokemon(selectedPokemon.filter((p) => p !== pokemon));
  };

  const filteredPokemon = popularPokemon.filter(
    (pokemon) =>
      pokemon.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedPokemon.includes(formatForSprite(pokemon))
  );

  if (!isEditing && hasExistingTeam) {
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
          className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Your Team - {stageName}</h2>
              <p className="text-neutral-400">Team submitted successfully</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {selectedPokemon.map((pokemon, index) => (
                <div
                  key={pokemon}
                  className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-2 relative">
                    <img
                      src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${pokemon}.png`}
                      alt={formatForDisplay(pokemon)}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                  </div>
                  <p className="text-sm text-white font-medium">{formatForDisplay(pokemon)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 hover:border-blue-500 rounded-lg text-blue-400 hover:text-blue-300 transition-all duration-200"
            >
              <FiEdit className="w-4 h-4" />
              Edit Team
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div className="min-h-screen p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-7xl max-h-[95vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {hasExistingTeam ? "Edit" : "Select"} Your Team - {stageName}
              </h2>
              <p className="text-neutral-400">Choose your Pokémon for this stage</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Your Team ({selectedPokemon.length} Pokémon)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {selectedPokemon.map((pokemon, index) => (
                <motion.div
                  key={pokemon}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-2 relative">
                    <img
                      src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${pokemon}.png`}
                      alt={formatForDisplay(pokemon)}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                  </div>
                  <p className="text-sm text-white font-medium">{formatForDisplay(pokemon)}</p>
                  <button
                    onClick={() => removePokemon(pokemon)}
                    className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add Pokémon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Search Pokémon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:border-red-500/50 focus:outline-none transition-colors"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Custom Pokémon name..."
                  value={customPokemon}
                  onChange={(e) => setCustomPokemon(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomPokemon()}
                  className="flex-1 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:border-red-500/50 focus:outline-none transition-colors"
                />
                <button
                  onClick={addCustomPokemon}
                  disabled={!customPokemon.trim() || !isValidPokemonName(customPokemon)}
                  className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              💡 Check{" "}
              <a
                href="https://msikma.github.io/pokesprite/overview/dex-gen8-new.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 underline"
              >
                PokeSprite's website
              </a>{" "}
              for exact Pokémon names. Use hyphens for spaces (e.g., "Necrozma Dusk" →
              "necrozma-dusk")
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium text-white mb-3">Popular Pokémon</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-3 max-h-80 overflow-y-auto">
              {filteredPokemon.slice(0, 40).map((pokemon) => (
                <button
                  key={pokemon}
                  onClick={() => addPokemon(pokemon)}
                  className="bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700 hover:border-red-500/50 rounded-lg p-3 text-center transition-all duration-200"
                >
                  <div className="w-12 h-12 mx-auto mb-2">
                    <img
                      src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${formatForSprite(
                        pokemon
                      )}.png`}
                      alt={pokemon}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-xs text-white">{pokemon}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700/50">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitTeam}
              disabled={selectedPokemon.length === 0 || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-4 h-4" />
              {isLoading ? "Saving..." : hasExistingTeam ? "Update" : "Submit"} Team (
              {selectedPokemon.length} Pokémon)
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
