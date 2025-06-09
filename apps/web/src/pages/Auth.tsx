import { useState } from "react";
import AuthForm from "../components/auth/AuthForm";
import InfoCard from "../components/auth/InfoCard";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <AuthForm
          isLogin={isLogin}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onToggleMode={toggleMode}
        />
        <InfoCard />
      </div>
    </div>
  );
}
