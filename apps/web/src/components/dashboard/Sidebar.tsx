import { motion } from "framer-motion";
import { FiHome, FiLogOut, FiPlus, FiUser, FiUsers } from "react-icons/fi";
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
}

export default function Sidebar({ userData }: SidebarProps) {
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

  return (
    <div className="w-64 h-screen bg-neutral-900/70 backdrop-blur-md border-r border-neutral-800 flex flex-col overflow-hidden">
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neutral-700/50 hover:bg-red-500/20 border border-neutral-600 hover:border-red-500/50 rounded-lg text-neutral-300 hover:text-red-400 transition-all duration-200 text-sm"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
