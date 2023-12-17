import React from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  return (
    <div className="App flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-8">Choose Login</h1>
        <button
          onClick={() => navigate("/admin/login")}
          type="button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mr-4"
        >
          Admin Login
        </button>
        <button
          onClick={() => navigate("/user/login")}
          type="button"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
        >
          User Login
        </button>
      </div>
    </div>
  );
}

export default App;
