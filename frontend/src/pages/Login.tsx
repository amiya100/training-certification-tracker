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

  const USER_EMAIL = "skillflow@gmail.com";
  const USER_PASSWORD = "skillflow1";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      email.trim().toLowerCase() === USER_EMAIL.toLowerCase() &&
      password === USER_PASSWORD
    ) {
      onLogin();
    } else {
      setError("Invalid email or password");
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
        className="w-[380px] p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-2xl"
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

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-lg bg-gray-900 border border-white/10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-medium"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
