import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const UserPhotos = () => {
  const navigate = useNavigate();
  const { usernameId } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log(usernameId);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username ) {
      navigate("/admin/login");
    } else {
      setUsername(username);
      setUserToken(token);
    }

    fetchUserImages(username, token);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUserImages = async (username, token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/user/images?username=${usernameId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const images = data.images.map((image) => ({
          src: `http://localhost:5000/${image}`,
          id: Date.now() + Math.random(),
        }));
        setUploadedImages(images);
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

  const goToHome = () => {
    navigate("/admin/dashboard");
  };

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowModal(true);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

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
        <div className="px-8">
          <button
            onClick={goToHome}
            className="mx-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Home
          </button>
          <button
            onClick={logoutUser}
            className="mx-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto py-8">
        <h1 className="text-3xl font-semibold mb-4"> {usernameId}</h1>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {uploadedImages.map((image, index) => (
            <div
              key={image.id}
              className="relative"
              onClick={() => handleImageClick(image.src)}
            >
              <img
                src={image.src}
                alt={`Uploaded ${index}`}
                className="w-full rounded cursor-pointer"
              />
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div className="bg-white p-8 max-w-lg max-h-screen overflow-auto">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full rounded"
              />
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPhotos;
