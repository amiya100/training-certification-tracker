function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-8">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
                Welcome to React + TypeScript + Tailwind
            </h1>
            <p className="text-xl text-gray-600 mb-8">
                Tailwind CSS is now successfully configured! 🎉
            </p>
            <div className="flex gap-4">
                <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                    Get Started
                </button>
                <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                    Learn More
                </button>
            </div>
        </div>
    );
}

export default App;
