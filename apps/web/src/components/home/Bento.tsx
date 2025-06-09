import { motion } from "framer-motion";
import { FaChartLine, FaFire, FaGamepad, FaStar, FaTrophy, FaUsers } from "react-icons/fa";

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
            Everything You Need for <span className="text-red-500">Epic Battles</span>
          </h2>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Comprehensive tournament management with style and precision
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
            className="md:col-span-2 lg:row-span-2 bg-gradient-to-br from-neutral-900/70 to-neutral-800/70 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <div className="h-full flex flex-col">
              <FaTrophy className="text-red-500 text-4xl mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-4">Tournament Brackets</h3>
              <p className="text-neutral-400 mb-6 flex-grow">
                Create and manage professional tournament brackets with automated matchmaking,
                real-time updates, and comprehensive scoring systems.
              </p>
              <div className="flex items-center gap-2 text-red-400">
                <span className="text-sm font-semibold">Learn More</span>
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
            className="bg-gradient-to-br from-red-600/90 to-red-700/90 backdrop-blur-sm rounded-2xl p-6 border border-red-500/50 group cursor-pointer"
          >
            <FaUsers className="text-white text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Team Rosters</h3>
            <p className="text-red-100 text-sm">
              Organize teams and manage player lineups effortlessly.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-neutral-800/70 to-neutral-900/70 backdrop-blur-sm rounded-2xl p-6 border border-neutral-600/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <FaChartLine className="text-red-400 text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
            <p className="text-neutral-400 text-sm">
              Track performance and statistics in real-time.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="md:col-span-2 bg-gradient-to-r from-neutral-900/70 via-red-950/70 to-neutral-900/70 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <FaGamepad className="text-red-500 text-3xl group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Multi-Game Support</h3>
                <p className="text-neutral-400 text-sm">
                  Support for Pokemon, Smash Bros, and more competitive games
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-neutral-800/70 to-neutral-900/70 backdrop-blur-sm rounded-2xl p-6 border border-neutral-600/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <FaStar className="text-yellow-400 text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Rankings</h3>
            <p className="text-neutral-400 text-sm">Global leaderboards and player rankings.</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-neutral-900/70 to-red-950/70 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-red-500/50 transition-all duration-300 group cursor-pointer"
          >
            <FaFire className="text-orange-400 text-3xl mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-2">Live Events</h3>
            <p className="text-neutral-400 text-sm">
              Stream and broadcast tournaments with real-time updates.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
