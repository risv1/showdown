import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaSpinner, FaUser } from "react-icons/fa";

interface AuthFormProps {
  isLogin: boolean;
  formData: {
    username: string;
    email: string;
    password: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleMode: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function AuthForm({
  isLogin,
  formData,
  onInputChange,
  onSubmit,
  onToggleMode,
  isLoading = false,
  error,
}: AuthFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-md mx-auto lg:mx-0"
    >
      <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-8 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Welcome Back" : "Join the Battle"}
          </h1>
          <p className="text-neutral-400">
            {isLogin ? "Sign in to your account" : "Create your account to get started"}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <p className="text-red-400 text-sm text-center">{error}</p>
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <label className="block text-sm font-medium text-neutral-300 mb-2">Username</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={onInputChange}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your username"
                required
              />
            </div>
          </motion.div>

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onInputChange}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isLogin ? 0.4 : 0.5, duration: 0.6 }}
          >
            <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={onInputChange}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
                required
              />
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isLogin ? 0.5 : 0.6, duration: 0.6 }}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <FaSpinner className="animate-spin" />}
            {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-neutral-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={onToggleMode}
              disabled={isLoading}
              className="text-red-500 hover:text-red-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
