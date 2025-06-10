import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import { API } from "../utils/constants";

interface UserData {
  id: number;
  username: string;
  email: string;
  showdownJoinDate?: string;
  createdAt: string;
}

export default function DashLayout() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          navigate("/auth");
          return;
        }

        const response = await fetch(
          API.BASE_URL + API.ENDPOINTS.AUTH.BASE_URL() + API.ENDPOINTS.AUTH.SESSION(),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.isAuthenticated) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          toast.error("Session expired. Please log in again.");
          navigate("/auth");
          return;
        }

        setUserData(result.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Session check failed:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        toast.error("Authentication failed. Please log in again.");
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20">
            <img src="/images/loader.svg" alt="Loading..." className="w-full h-full" />
          </div>
          <p className="text-white text-lg sm:text-xl">Authenticating...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  return (
    <>
      <Toaster
        position={isMobile ? "bottom-center" : "top-right"}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1a1a1a",
            color: "#fff",
            border: "1px solid #374151",
          },
          success: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-neutral-800/90 backdrop-blur-md border border-neutral-700 rounded-lg p-2 text-white hover:bg-neutral-700 transition-colors"
      >
        <motion.div
          animate={sidebarOpen ? "open" : "closed"}
          className="w-6 h-6 flex flex-col justify-center items-center"
        >
          <motion.span
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 6 },
            }}
            className="w-5 h-0.5 bg-white block transform transition-transform origin-center"
          />
          <motion.span
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 },
            }}
            className="w-5 h-0.5 bg-white block transform transition-opacity mt-1"
          />
          <motion.span
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -6 },
            }}
            className="w-5 h-0.5 bg-white block transform transition-transform origin-center mt-1"
          />
        </motion.div>
      </button>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <div className="h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 flex overflow-hidden">
        <Sidebar userData={userData} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-16 lg:pt-6">
            <Outlet context={{ userData, loading: false }} />
          </div>
        </main>
      </div>
    </>
  );
}
