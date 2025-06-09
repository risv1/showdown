import { motion } from "framer-motion";
import { FaGamepad, FaGithub, FaHeart } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaGamepad className="text-red-500 text-2xl" />
              <h3 className="text-2xl font-bold text-white">Showdown</h3>
            </div>
            <p className="text-neutral-400 mb-6 max-w-md">
              Tournament management platform for Pokemon battles. Create dynamic tournaments, manage
              teams, and track results.
            </p>
            <p className="text-neutral-500 text-sm mb-4">
              Built with data from Smogon Pokemon Showdown and sprites from PokeSprite.
            </p>
            <div className="flex items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://github.com/risv1/showdown"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <FaGithub className="text-xl" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col justify-end"
          >
            <div className="text-right">
              <p className="text-neutral-400 text-sm mb-2">
                Thanks to{" "}
                <a
                  href="https://pokemonshowdown.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Smogon Pokemon Showdown
                </a>{" "}
                and{" "}
                <a
                  href="https://github.com/msikma/pokesprite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  PokeSprite
                </a>
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-neutral-800/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">© 2025 MIT License.</p>
          <div className="flex items-center gap-1 text-neutral-400 text-sm">
            Made with <FaHeart className="text-red-500 mx-1" /> by{" "}
            <a
              href="https://github.com/risv1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 transition-colors ml-1"
            >
              risv1
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
