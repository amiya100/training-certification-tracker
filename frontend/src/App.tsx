import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";

const App: React.FC = () => {
    return (
        <div className="flex h-screen bg-dark-bg text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-auto">
                    <Dashboard />
                </main>
            </div>
        </div>
    );
};

export default App;
