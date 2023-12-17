const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

const users = {
  users: [
    {
      username: "mahimabalmiki13",
      password: "123456",
    },
    {
      username: "someone",
      password: "123456",
    },
  ],
};

const admins = {
  admins: [
    {
      username: "admin",
      password: "123456",
    },
  ],
};

var userTokens = new Map();
var adminTokens = new Map();

app.post("/user/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    const token = jwt.sign({ username: user.username }, "mahimabalmiki", {
      expiresIn: "1h",
    });

    userTokens.set(username, token);

    res.json({ status: "success", message: "Login successful", token });
  } else {
    res
      .status(401)
      .json({ status: "failure", message: "Invalid username or password" });
  }
});

app.post("/user/verify", (req, res) => {
  const { username } = req.body;
  const token = req.headers["authorization"];

  const storedToken = userTokens.get(username);

  if (storedToken === token) {
    jwt.verify(token, "mahimabalmiki", (err, authData) => {
      if (err) {
        res
          .status(403)
          .json({ status: "failure", message: "Token verification failed" });
      } else {
        res.json({ status: "success", message: "Token verified successfully" });
      }
    });
  } else {
    res
      .status(401)
      .json({ status: "failure", message: "Invalid token for the username" });
  }
});

app.post("/upload", (req, res) => {
  const token = req.headers["authorization"];
  if (token) {
    jwt.verify(token, "mahimabalmiki", (err, authData) => {
      if (err) {
        res
          .status(403)
          .json({ status: "failure", message: "Token verification failed" });
      } else {
        const storage = multer.diskStorage({
          destination: function (req, file, cb) {
            const userFolder = `./uploads/${authData.username}`;
            if (!fs.existsSync(userFolder)) {
              fs.mkdirSync(userFolder);
            }
            cb(null, userFolder);
          },
          filename: function (req, file, cb) {
            cb(
              null,
              file.fieldname +
                "-" +
                Date.now() +
                path.extname(file.originalname)
            );
          },
        });

        const upload = multer({ storage: storage });
        upload.single("photo")(req, res, async (err) => {
          if (err) {
            console.log("err", err);
            res
              .status(500)
              .json({ status: "failure", message: "Error uploading image" });
          } else {
            const imagePath = `./uploads/${authData.username}/${req.file.filename}`;
            const outputWebpPath = `./uploads/${
              authData.username
            }/${req.file.filename.split(".").slice(0, -1).join(".")}.webp`;

            try {
              await sharp(imagePath).toFile(outputWebpPath);
              fs.unlinkSync(imagePath);

              res.json({
                status: "success",
                message: "File uploaded and converted to WebP successfully",
              });
            } catch (conversionError) {
              console.error("Error converting image to WebP:", conversionError);
              res.status(500).json({
                status: "failure",
                message: "Error converting image to WebP",
              });
            }
          }
        });
      }
    });
  } else {
    res
      .status(401)
      .json({ status: "failure", message: "Invalid token for the username" });
  }
});

app.get("/user/images", (req, res) => {
  const username = req.query.username;
  const token = req.headers["authorization"];
  if (token) {
    const userFolder = `./uploads/${username}`;
    fs.readdir(userFolder, (err, files) => {
      if (err) {
      console.log(err);

        res
          .status(500)
          .json({ status: "failure", message: "Error retrieving images" });
      } else {
        const images = files.map((file) => `uploads/${username}/${file}`);
        // console.log(images);
        res.json({ status: "success", images });
      }
    });
  } else {
    res
      .status(401)
      .json({ status: "failure", message: "Invalid token for the username" });
  }
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  const admin = admins.admins.find(
    (admin) => admin.username === username && admin.password === password
  );

  if (admin) {
    const token = jwt.sign({ username: admin.username }, "mahimabalmiki", {
      expiresIn: "1h",
    });

    adminTokens.set(username, token);

    res.json({ status: "success", message: "Login successful", token });
  } else {
    res
      .status(401)
      .json({ status: "failure", message: "Invalid username or password" });
  }
});

app.get("/admin/get-all-users", (req, res) => {
  const token = req.headers["authorization"];
  if (token) {
    res.json({ status: "success", users: users.users });
  } else {
    res
      .status(401)
      .json({ status: "failure", message: "Invalid token for the username" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
