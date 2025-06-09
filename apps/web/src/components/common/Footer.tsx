import { motion } from "framer-motion";
import { FaDiscord, FaGamepad, FaGithub, FaHeart, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaGamepad className="text-red-500 text-2xl" />
              <h3 className="text-2xl font-bold text-white">Showdown</h3>
            </div>
            <p className="text-neutral-400 mb-6 max-w-md">
              The ultimate tournament management platform for competitive gaming. Bringing players
              together for unforgettable battles.
            </p>
            <div className="flex items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <FaGithub className="text-xl" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <FaTwitter className="text-xl" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <FaDiscord className="text-xl" />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Tournaments", "Teams", "Rankings", "Events"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {["Help Center", "Community", "Contact", "API Docs"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-neutral-400 hover:text-red-500 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-neutral-800/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-neutral-400 text-sm mb-4 md:mb-0">
            © 2025 Rishi Viswanathan. MIT License.
          </p>
          <div className="flex items-center gap-1 text-neutral-400 text-sm">
            Made with <FaHeart className="text-red-500 mx-1" /> for the competitive gaming community
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
