import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
  const navigate = useNavigate();

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
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-white text-lg">Authenticating...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 flex overflow-hidden">
      <Sidebar userData={userData} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ userData, loading: false }} />
        </div>
      </main>
    </div>
  );
}
