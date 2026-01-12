// pages/Login.tsx
import React, { useState } from "react";
import logo from "../assets/logo.png";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", { // ✅ FastAPI endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Login failed"); // ✅ FastAPI returns "detail" on error
      } else {
        localStorage.setItem("token", data.access_token); // ✅ store JWT
        onLogin();
      }
    } catch (err) {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen text-white bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://cdn.wallpapersafari.com/97/31/nsDGar.jpg')",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-[380px] p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-2xl relative"
      >
        <div className="flex flex-col items-center mb-6">
          <img src={logo} className="w-12 h-12" />
          <p className="mt-2 text-lg font-semibold tracking-wide">SkillFlow</p>
        </div>

        <h2 className="text-xl font-semibold text-center mb-6">Sign in</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-900 border border-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-white/10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-medium"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
