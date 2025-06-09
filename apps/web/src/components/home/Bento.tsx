import { motion } from "framer-motion";
import { FaBolt, FaDownload, FaGamepad, FaLayerGroup, FaMedal, FaUsers } from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Bento() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything You Need for <span className="text-red-500">Epic Tournaments</span>
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Create dynamic tournaments with custom teams, staged brackets, and downloadable results
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-2 lg:row-span-2 bg-gradient-to-br from-red-900/40 via-red-800/40 to-neutral-900/70 backdrop-blur-sm rounded-2xl p-8 border border-red-500/50 hover:border-red-400/70 transition-all duration-300 group cursor-pointer"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <FaBolt className="text-red-400 text-4xl group-hover:scale-110 transition-transform" />
                <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-full border border-red-500/30">
                  DYNAMIC
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Dynamic Tournament Manager</h3>
              <p className="text-neutral-300 mb-6 flex-grow">
                Create and manage tournaments with flexible bracket systems. Support for various
                tournament formats with automated progression and match tracking.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-red-300 text-sm">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Custom bracket generation
                </div>
                <div className="flex items-center gap-2 text-red-300 text-sm">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Automated match progression
                </div>
                <div className="flex items-center gap-2 text-red-300 text-sm">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  Tournament result tracking
                </div>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <span className="text-sm font-semibold">Start Tournament</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-neutral-800/70 to-neutral-900/70 backdrop-blur-sm rounded-2xl p-6 border border-neutral-600/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <FaUsers className="text-red-400 text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Custom Teams</h3>
            <p className="text-neutral-400 text-sm">
              Build and organize teams with player management and roster tracking.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-neutral-800/70 to-neutral-900/70 backdrop-blur-sm rounded-2xl p-6 border border-neutral-600/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <FaLayerGroup className="text-red-400 text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Staged Events</h3>
            <p className="text-neutral-400 text-sm">
              Multi-phase tournaments with custom stages and progression rules.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-2 bg-gradient-to-r from-neutral-900/70 to-neutral-950/70 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <FaMedal className="text-red-400 text-3xl group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Tournament Leaderboards</h3>
                <p className="text-neutral-400 text-sm">
                  Track player performance and rankings across tournaments
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-neutral-800/70 to-neutral-900/70 backdrop-blur-sm rounded-2xl p-6 border border-neutral-600/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <FaDownload className="text-red-400 text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Export Results</h3>
            <p className="text-neutral-400 text-sm">
              Download tournament brackets and results in multiple formats.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-neutral-800/70 to-neutral-900/70 backdrop-blur-sm rounded-2xl p-6 border border-neutral-600/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <FaGamepad className="text-red-400 text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Pokemon Battles</h3>
            <p className="text-neutral-400 text-sm">
              Built for Pokemon tournament management with comprehensive tracking.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
