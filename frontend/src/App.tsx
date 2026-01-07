import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

const App: React.FC = () => {
    return (
        <Router>
            <div className="flex h-screen bg-dark-bg text-white">
                <Sidebar />

                <div className="flex-1 flex flex-col">
                    <Header />

                    <main className="flex-1 overflow-auto">
                        <Routes>
                            {/* HR / Admin Dashboard */}
                            <Route path="/" element={<Dashboard />} />

                            {/* Employee Dashboard */}
                            <Route
                                path="/employee"
                                element={<EmployeeDashboard />}
                            />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
};

export default App;
