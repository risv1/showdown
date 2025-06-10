import { motion } from "framer-motion";
import { FiHome, FiLogOut, FiPlus, FiUser, FiUsers, FiX } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/auth";

interface UserData {
  id: number;
  username: string;
  email: string;
  showdownJoinDate?: string;
  createdAt: string;
}

interface SidebarProps {
  userData: UserData | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ userData, isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { icon: FiHome, label: "Dashboard", path: "/dashboard" },
    { icon: FiPlus, label: "Create", path: "/dashboard/create" },
    { icon: FiUsers, label: "Join", path: "/dashboard/join" },
  ];

  const handleLogout = () => {
    logout();
  };

  const isActiveRoute = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <div className="hidden lg:flex w-64 h-screen bg-neutral-900/70 backdrop-blur-md border-r border-neutral-800 flex-col overflow-hidden">
        <div className="p-6 border-b border-neutral-800 shrink-0">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
          >
            <span className="text-red-500">Show</span>down
          </motion.h1>
          <p className="text-sm text-neutral-400 mt-1">Tournament Manager</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-hidden">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActiveRoute(item.path)
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {userData && (
          <div className="p-4 border-t border-neutral-800 shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-neutral-800/50 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{userData.username}</p>
                  <p className="text-xs text-neutral-400 truncate">{userData.email}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex gap-3 items-center w-fit sm:w-auto border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </motion.div>
          </div>
        )}
      </div>

      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="lg:hidden fixed left-0 top-0 z-50 w-80 max-w-[85vw] h-screen bg-neutral-900/95 backdrop-blur-md border-r border-neutral-800 flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-neutral-800 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              <span className="text-red-500">Show</span>down
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Tournament Manager</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group ${
                  isActiveRoute(item.path)
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                }`}
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-base">{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {userData && (
          <div className="p-4 border-t border-neutral-800 shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-neutral-800/50 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-base">{userData.username}</p>
                  <p className="text-sm text-neutral-400 truncate">{userData.email}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="flex gap-3 items-center w-fit sm:w-auto border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
}
