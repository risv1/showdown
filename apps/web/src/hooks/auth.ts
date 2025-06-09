/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API } from "../utils/constants";

interface User {
  id: number;
  username: string;
  email: string;
  showdownJoinDate?: string;
  createdAt: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthError {
  error: string;
  details?: any[];
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const saveTokenAndUser = (token: string, userData: User) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL + API.ENDPOINTS.AUTH.BASE_URL() + API.ENDPOINTS.AUTH.REGISTER(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const authError = result as AuthError;
        throw new Error(authError.error || "Registration failed");
      }

      const authResponse = result as AuthResponse;
      saveTokenAndUser(authResponse.token, authResponse.user);

      toast.success(`Welcome to Showdown, ${authResponse.user.username}! 🎉`);
      navigate("/dashboard");

      return authResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API.BASE_URL + API.ENDPOINTS.AUTH.BASE_URL() + API.ENDPOINTS.AUTH.LOGIN(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const authError = result as AuthError;
        throw new Error(authError.error || "Login failed");
      }

      const authResponse = result as AuthResponse;
      saveTokenAndUser(authResponse.token, authResponse.user);

      toast.success(`Welcome back, ${authResponse.user.username}! 🚀`);
      navigate("/dashboard");

      return authResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    toast.success("Logged out successfully! 👋");
    navigate("/auth");
  };

  const checkSession = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        return false;
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
        clearAuth();
        return false;
      }

      setUser(result.user);
      return true;
    } catch (error) {
      console.error("Session check failed:", error);
      clearAuth();
      return false;
    }
  };

  const getToken = () => {
    return localStorage.getItem("authToken");
  };

  const isAuthenticated = () => {
    return !!getToken();
  };

  const getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  return {
    user,
    isLoading,
    error,
    register,
    login,
    logout,
    checkSession,
    getToken,
    isAuthenticated,
    getCurrentUser,
    clearError: () => setError(null),
  };
};
