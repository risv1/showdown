import { useState } from "react";
import { Toaster } from "react-hot-toast";
import AuthForm from "../components/auth/AuthForm";
import InfoCard from "../components/auth/InfoCard";
import { useAuth } from "../hooks/auth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { register, login, isLoading, error, clearError } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) {
      clearError();
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: "", email: "", password: "" });
    clearError();
  };

  return (
    <>
      <Toaster
        position="top-right"
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          <AuthForm
            isLogin={isLogin}
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onToggleMode={toggleMode}
            isLoading={isLoading}
            error={error}
          />
          <InfoCard />
        </div>
      </div>
    </>
  );
}
