import { motion } from "framer-motion";
import { FaPlay, FaTrophy } from "react-icons/fa";
import { useNavigate } from "react-router";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center pt-10">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-2 text-red-500"
          >
            <FaTrophy className="text-xl" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Tournaments & Teams
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl lg:text-7xl font-bold text-white leading-tight"
          >
            Playing <span className="text-red-500">Showdown</span>{" "}
            <span className="text-neutral-300">with the Bois</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-neutral-400 leading-relaxed max-w-lg"
          >
            Organize epic tournaments, manage teams, and track your competitive journey. Ready to
            prove who's the best?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/auth")}
              className="group border border-red-600 hover:border-red-500 text-red-500 hover:text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center gap-3 hover:bg-red-500/10"
            >
              <FaPlay className="group-hover:translate-x-1 transition-transform" />
              Get Started
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-neutral-800/30 to-neutral-900/30 backdrop-blur-sm rounded-2xl border border-neutral-700/50 flex items-center justify-center relative overflow-hidden"
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              src="/images/red.png"
              alt="Pokemon Red"
              className="max-w-full max-h-full px-12"
            />

            <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="absolute top-1/3 left-6 w-1 h-1 bg-red-300 rounded-full"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
