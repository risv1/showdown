import { motion } from "framer-motion";
import { FaGamepad, FaTrophy, FaUsers } from "react-icons/fa";

export default function AuthInfoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="hidden lg:block"
    >
      <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8 h-full">
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative"
          >
            <img
              src="/images/char.png"
              alt="Character"
              className="w-32 h-32 rounded-full border-4 border-red-500 object-cover"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <FaGamepad className="text-white text-sm" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-white">
              Join the Ultimate <span className="text-red-500">Showdown</span>
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              Create and manage tournaments, build your team, and compete with friends in the most
              exciting Pokemon battles.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="grid grid-cols-1 gap-4 w-full"
          >
            <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
              <FaTrophy className="text-red-500 text-xl" />
              <div className="text-left">
                <h3 className="text-white font-semibold">Tournaments</h3>
                <p className="text-neutral-400 text-sm">Organize epic competitions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
              <FaUsers className="text-red-500 text-xl" />
              <div className="text-left">
                <h3 className="text-white font-semibold">Team Management</h3>
                <p className="text-neutral-400 text-sm">Build your dream squad</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
              <FaGamepad className="text-red-500 text-xl" />
              <div className="text-left">
                <h3 className="text-white font-semibold">Battle Tracking</h3>
                <p className="text-neutral-400 text-sm">Monitor your progress</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
