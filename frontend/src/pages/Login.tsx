// pages/Login.tsx
import React, { useState } from "react";
import logo from "../assets/logo.png";
import { apiService } from "../services/api";

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
            // Use apiService.login() instead of direct fetch
            await apiService.login(email, password);
            onLogin(); // Login successful
        } catch (err) {
            // Handle specific error messages from the API
            if (err instanceof Error) {
                const errorMsg = err.message;
                if (errorMsg.includes("401") || errorMsg.includes("Invalid")) {
                    setError("Invalid email or password");
                } else if (
                    errorMsg.includes("Network") ||
                    errorMsg.includes("Failed to fetch")
                ) {
                    setError(
                        "Cannot connect to server. Please check if the backend is running."
                    );
                } else {
                    setError(errorMsg);
                }
            } else {
                setError("Login failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Test connection button (optional, for debugging)
    const testConnection = async () => {
        try {
            const response = await fetch(
                `${
                    import.meta.env.VITE_API_URL || "http://localhost:8000"
                }/health`
            );
            if (response.ok) {
                alert(
                    `✅ Connected to API at: ${
                        import.meta.env.VITE_API_URL || "http://localhost:8000"
                    }`
                );
            } else {
                alert(`❌ API error: ${response.status}`);
            }
        } catch (err) {
            alert(`❌ Cannot connect to API. Make sure backend is running.`);
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
                    <img
                        src={logo}
                        className="w-12 h-12"
                        alt="SkillFlow Logo"
                    />
                    <p className="mt-2 text-lg font-semibold tracking-wide">
                        SkillFlow
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        Training & Certification Tracker
                    </p>
                </div>

                <h2 className="text-xl font-semibold text-center mb-6">
                    Sign in
                </h2>

                {/* Debug info (visible in development only) */}
                {import.meta.env.DEV && (
                    <div className="mb-4 p-2 text-xs bg-blue-900/30 rounded">
                        <p>
                            API:{" "}
                            {import.meta.env.VITE_API_URL ||
                                "http://localhost:8000"}
                        </p>
                        <button
                            type="button"
                            onClick={testConnection}
                            className="mt-1 text-blue-400 hover:underline"
                        >
                            Test Connection
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 text-sm bg-red-900/30 border border-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-white/10 focus:border-blue-500 focus:outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-white/10 focus:border-blue-500 focus:outline-none transition pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-medium hover:opacity-90 transition disabled:opacity-50"
                    disabled={loading || !email || !password}
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin h-5 w-5 mr-3 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Logging in...
                        </span>
                    ) : (
                        "Login"
                    )}
                </button>

                {/* Demo credentials hint */}
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400 text-center">
                    <p>Demo credentials:</p>
                    <p>Email: skillflow@gmail.com</p>
                    <p>Password: skillflow1</p>
                </div>
            </form>
        </div>
    );
};

export default Login;
