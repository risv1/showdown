import { motion } from "framer-motion";
import { FaGamepad, FaHome } from "react-icons/fa";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-8xl mb-4"
        >
          <FaGamepad className="text-red-500 mx-auto" />
        </motion.div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-neutral-400 mb-8">Tournament not found!</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <FaHome />
          Back to Arena
        </Link>
      </motion.div>
    </div>
  );
}
