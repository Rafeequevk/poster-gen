const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/generate-poster", upload.single("photo"), async (req, res) => {
  try {
    const { name } = req.body;
    const inputImage = req.file.path;
    const outputImage = path.join(__dirname, "output", `${Date.now()}.png`);

    // Load template and overlay user photo
    await sharp("template.png")
      .composite([{ input: inputImage, top: 100, left: 100 }]) // Adjust as needed
      .toFile(outputImage);

    res.json({ posterUrl: `http://localhost:5000/${outputImage}` });
  } catch (error) {
    res.status(500).json({ error: "Error generating poster" });
  }
});

app.use("/output", express.static("output"));

app.listen(5000, () => console.log("Server running on port 5000"));
