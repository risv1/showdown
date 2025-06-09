import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";

interface UserData {
  username: string;
  email: string;
}

export default function DashLayout() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState("zarel");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://pokemonshowdown.com/users/${currentUser}.json`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 flex overflow-hidden">
      <Sidebar userData={userData} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ userData, loading }} />
        </div>
      </main>
    </div>
  );
}
