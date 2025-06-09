import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiArrowRight, FiCalendar, FiMail, FiPlus, FiShield, FiUser } from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";
import { usePokemon } from "../../hooks/pokemon";
import { useTournaments } from "../../hooks/tournaments";

interface UserData {
  username: string;
  userid: string;
  registertime: number;
  group: number;
}

interface ContextType {
  userData: UserData | null;
  loading: boolean;
}

interface Tournament {
  id: number;
  name: string;
  format: string;
  description: string;
  maxPlayers: number;
  currentPlayers: number;
  creator: number;
  isStarted: boolean;
  joinsDisabled: boolean;
  createdAt: string;
  updatedAt: string;
  wins: number;
  losses: number;
  points: number;
  pokemonTeam?: string[];
  stages?: Array<{
    name: string;
    playersSelected: number;
  }>;
  isParticipating?: boolean;
}

export default function DashboardHome() {
  const { userData, loading } = useOutletContext<ContextType>();
  const { getUserTournaments, isLoading } = useTournaments();
  const { formatForDisplay } = usePokemon();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const userTournaments = await getUserTournaments();
        const transformedTournaments: Tournament[] = userTournaments.map((t) => ({
          id: t.id,
          name: t.name,
          format: t.format,
          description: t.description || "",
          maxPlayers: t.maxPlayers || 0,
          currentPlayers: t.currentPlayers || 0,
          creator: t.creator || 0,
          isStarted: t.isStarted || false,
          joinsDisabled: t.joinsDisabled || false,
          createdAt: t.createdAt || "",
          updatedAt: t.updatedAt || "",
          wins: t.wins || 0,
          losses: t.losses || 0,
          points: t.points || 0,
          pokemonTeam: t.pokemonTeam || [],
          stages: t.stages || [],
          isParticipating: t.isParticipating,
        }));
        setTournaments(transformedTournaments);
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      }
    };

    if (userData && !loading) {
      fetchTournaments();
    }
  }, [userData, loading]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getGreeting = () => {
    const timeGreeting = getTimeOfDay();
    return userData ? `${timeGreeting}, ${userData.username}` : `${timeGreeting}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleGoToTournament = (tournamentId: string) => {
    navigate(`/dashboard/tournaments/${tournamentId}`);
  };

  const handleJoinTournament = () => {
    navigate("/dashboard/join");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-lg"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  const renderTournamentSection = () => {
    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-8"
        >
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-400">Loading tournaments...</p>
          </div>
        </motion.div>
      );
    }

    const tournamentCount = tournaments.length;

    if (tournamentCount === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-8 hover:border-red-500/30 transition-all duration-300"
        >
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full border border-red-500/30 flex items-center justify-center">
                <FiPlus className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Join a Tournament</h3>
                <p className="text-neutral-400 text-lg max-w-md mx-auto">
                  Join a tournament to start tracking your competitive stats and building your team
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinTournament}
                className="inline-flex items-center gap-3 px-8 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-xl text-red-400 hover:text-red-300 transition-all duration-200 font-semibold"
              >
                <FiPlus className="w-5 h-5" />
                Join Tournament
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      );
    } else if (tournamentCount === 1) {
      const tournament = tournaments[0];
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-8 hover:border-red-500/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{tournament.name}</h2>
              <div className="flex items-center gap-4">
                <span className="border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm">
                  {tournament.format}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-neutral-400">
                    <span className="text-white font-semibold">{tournament.wins}</span> W
                  </span>
                  <span className="text-neutral-400">
                    <span className="text-white font-semibold">{tournament.losses}</span> L
                  </span>
                  <span className="text-neutral-400">
                    <span className="text-white font-semibold">{tournament.points}</span> Pts
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGoToTournament(tournament.id.toString())}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-xl text-red-400 hover:text-red-300 transition-all duration-200"
            >
              View Tournament
              <FiArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {tournament.pokemonTeam && tournament.pokemonTeam.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiShield className="w-5 h-5 text-red-400" />
                Your Team
              </h3>
              <div className="grid grid-cols-6 gap-6">
                {tournament.pokemonTeam.map((pokemon, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="text-center group cursor-pointer"
                  >
                    <div className="w-24 h-24 mx-auto mb-3 relative border border-neutral-700/50 rounded-lg p-2 group-hover:border-red-500/30 transition-colors">
                      <img
                        src={`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${pokemon}.png`}
                        alt={formatForDisplay(pokemon)}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-neutral-900">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-400 group-hover:text-white transition-colors font-medium">
                      {formatForDisplay(pokemon)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Your Tournaments</h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinTournament}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 hover:border-red-500 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200"
            >
              <FiPlus className="w-4 h-4" />
              Join Another
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => handleGoToTournament(tournament.id.toString())}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {tournament.name}
                    </h3>
                    <span className="border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-sm">
                      {tournament.format}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">
                      <span className="text-white font-semibold">{tournament.wins}</span> W
                    </span>
                    <span className="text-neutral-400">
                      <span className="text-white font-semibold">{tournament.losses}</span> L
                    </span>
                    <span className="text-neutral-400">
                      <span className="text-white font-semibold">{tournament.points}</span> Pts
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-neutral-400 text-sm">
                      {tournament.wins + tournament.losses} battles
                    </span>
                    <FiArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl lg:text-3xl font-bold text-white mb-2">{getGreeting()}</h1>
          <p className="text-neutral-400 text-xl mb-4">Welcome back to your competitive journey</p>

          {userData && (
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-red-400" />
                <span className="text-neutral-400">@{userData.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-red-400" />
                <span className="text-neutral-400">{userData.username}@showdown.com</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-red-400" />
                <span className="text-neutral-400">Since {formatDate(userData.registertime)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-2xl font-semibold text-white">{formatCurrentTime()}</p>
          <p className="text-neutral-400">{formatCurrentDate()}</p>
        </div>
      </motion.div>

      {userData && renderTournamentSection()}
    </div>
  );
}
