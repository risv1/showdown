import { useState } from "react";
import toast from "react-hot-toast";

import type { CreateTournamentData, Tournament } from "../types/tournaments";
import { API } from "../utils/constants";

export const useTournaments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const getUserTournaments = async (): Promise<Tournament[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API.BASE_URL + API.ENDPOINTS.TOURNAMENTS.BASE_URL(), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch user tournaments");
      }

      return result.tournaments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tournaments";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableTournaments = async (): Promise<Tournament[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL + API.ENDPOINTS.TOURNAMENTS.BASE_URL() + "/available",
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch available tournaments");
      }

      return result.tournaments;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tournaments";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createTournament = async (data: CreateTournamentData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API.BASE_URL + API.ENDPOINTS.TOURNAMENTS.BASE_URL(), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create tournament");
      }

      toast.success("Tournament created successfully! 🎉");
      return result.tournament;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create tournament";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const joinTournament = async (tournamentId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL + API.ENDPOINTS.TOURNAMENTS.BASE_URL() + `/${tournamentId}/join`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to join tournament");
      }

      toast.success("Successfully joined tournament! 🚀");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to join tournament";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const submitStageTeam = async (tournamentId: string, stageId: number, pokemonTeam: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL + API.ENDPOINTS.TOURNAMENTS.BASE_URL() + `/${tournamentId}/stage-team`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ stageId, pokemonTeam }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit team");
      }

      toast.success("Team submitted successfully! 🎯");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit team";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getStageTeam = async (tournamentId: string, stageId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL +
          API.ENDPOINTS.TOURNAMENTS.BASE_URL() +
          `/${tournamentId}/stage/${stageId}/team`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch stage team");
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch stage team";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTournament = async (tournamentId: string): Promise<Tournament> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL +
          API.ENDPOINTS.TOURNAMENTS.BASE_URL() +
          API.ENDPOINTS.TOURNAMENTS.GET_BY_ID(tournamentId),
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch tournament");
      }

      return result.tournament;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch tournament";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getPlayerTeam = async (tournamentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL +
          API.ENDPOINTS.TOURNAMENTS.BASE_URL() +
          API.ENDPOINTS.TOURNAMENTS.GET_TEAM(tournamentId),
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch team");
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch team";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disableJoins = async (tournamentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL +
          API.ENDPOINTS.TOURNAMENTS.BASE_URL() +
          API.ENDPOINTS.TOURNAMENTS.DISABLE_JOINS(tournamentId),
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to disable joins");
      }

      toast.success("Joins disabled successfully");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to disable joins";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const startTournament = async (tournamentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL +
          API.ENDPOINTS.TOURNAMENTS.BASE_URL() +
          API.ENDPOINTS.TOURNAMENTS.START(tournamentId),
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to start tournament");
      }

      toast.success("Tournament started successfully! 🎊");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start tournament";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const endTournament = async (tournamentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL +
          API.ENDPOINTS.TOURNAMENTS.BASE_URL() +
          API.ENDPOINTS.TOURNAMENTS.END(tournamentId),
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to end tournament");
      }

      toast.success("Tournament ended successfully! 🏆");
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to end tournament";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getUserTournaments,
    getAvailableTournaments,
    createTournament,
    joinTournament,
    submitStageTeam,
    getStageTeam,
    getTournament,
    getPlayerTeam,
    disableJoins,
    startTournament,
    endTournament,
    clearError: () => setError(null),
  };
};
