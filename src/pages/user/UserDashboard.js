import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageId, setImageId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      navigate("/user/login");
    } else {
      setUsername(username);
      setUserToken(token);
      verifyUser(username, token);
    }
    fetchUserImages(username, token);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUserImages = async (username, token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/user/images?username=${username}`,
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

  const verifyUser = async (username, token) => {
    try {
      const requestBody = { username };
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(requestBody),
      };

      const response = await fetch(
        "http://localhost:5000/user/verify",
        requestOptions
      );
      const data = await response.json();

      if (response.ok && data.status === "success") {
        console.log("User verified successfully");
      } else {
        console.error(data.message);
        logoutUser();
      }
    } catch (error) {
      console.error("Error verifying user:", error.message);
      logoutUser();
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/user/login");
  };

  const handleImageChange = (event) => {
    const imageFile = event.target.files[0];
    setSelectedImage(imageFile);
  };

  const handleImageUpload = () => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const uploadedImageContent = reader.result;

        const isDuplicate = uploadedImages.some(
          (image) => image.src === uploadedImageContent
        );

        if (!isDuplicate) {
          setUploadedImages([
            ...uploadedImages,
            { src: uploadedImageContent, id: Date.now() },
          ]);
          uploadImageToServer(selectedImage);
        } else {
          alert("This image is already uploaded.");
        }
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  const uploadImageToServer = async (imageFile) => {
    const formData = new FormData();
    formData.append("photo", imageFile);
    formData.append("username", username);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          Authorization: userToken,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Image uploaded successfully");
      } else {
        console.error("Image upload failed:", data.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error.message);
    }
  };

  const handleDelete = (id) => {
    const updatedImages = uploadedImages.filter((image) => image.id !== id);
    setUploadedImages(updatedImages);
  };

  const handleImageClick = (imageSrc,imageId) => {
    setImageId(imageId);
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
        <button
          onClick={logoutUser}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </header>
      <div className="max-w-screen-lg mx-auto py-8">
        <h1 className="text-3xl font-semibold mb-4">Welcome, {username}</h1>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4"
        />
        <button
          onClick={handleImageUpload}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload Image
        </button>
        <div className="mt-8 grid grid-cols-3 gap-4">
          {uploadedImages.map((image, index) => (
            
            <div
              key={image.id}
              className="relative"
              onClick={() => handleImageClick(image.src, image.id)}
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
                onClick={() => {
                  setShowModal(false)
                  setImageId(null)

                }}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(imageId)
                  setShowModal(false)
                  setImageId(null)
                }}
                className="mx-2 mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;
