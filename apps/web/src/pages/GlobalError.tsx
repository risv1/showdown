import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

export default function GlobalError() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4"
      >
        <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-4">Something went wrong!</h1>
        <p className="text-neutral-400 mb-6">The tournament has encountered an error.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Restart Battle
        </button>
      </motion.div>
    </div>
  );
}
