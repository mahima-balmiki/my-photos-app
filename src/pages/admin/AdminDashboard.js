import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username ) {
      navigate("/admin/login");
    } else {
      setUsername(username);
      setAdminToken(token);
    }
    fetchUserImages(username, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUserImages = async (username, token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/get-all-users`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        setUsers(data.users);
      } else {
        console.error("Failed to fetch images:", data.message);
      }
    } catch (error) {
      console.error("Error fetching images:", error.message);
    }
  };
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/admin/login");
  };

  return (
    <div>
      <header className="bg-gray-800 text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold" style={{ display: "flex" }}>
          <img
            className="w-8 h-8 mr-2"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
          ></img>
          My Photos App
        </h1>
        <button
          onClick={logoutUser}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </header>
      <div className="container mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-8 text-center">All Users</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white shadow-md rounded-md p-6 flex flex-col items-center"
            >
              <img
                src="/user-icon.svg"
                alt="User Icon"
                className="w-24 h-24 rounded-full mb-4"
              />
              <span className="text-lg font-semibold">{user.username}</span>
              <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
              onClick={() => navigate(`/admin/user-photos/${user.username}`)} 
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
