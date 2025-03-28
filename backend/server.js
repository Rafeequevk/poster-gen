const express = require("express");
const multer = require("multer");
const { createCanvas, loadImage } = require("canvas");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load .env file
const cors = require("cors"); // Import CORS


const app = express();
const upload = multer({ dest: "uploads/" }); // Temporary storage

app.use(cors({
    origin: "https://mern-poster-frontend.vercel.app",
    methods: "GET,POST",
    allowedHeaders: "Content-Type"
  }));

// Configure Cloudinary (Use Environment Variables)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.post("/generate-poster", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file || !req.body.name) {
      return res.status(400).json({ success: false, message: "Missing file or name" });
    }

    const userName = req.body.name;
    const templatePath = path.join(__dirname, "templates", "poster-template.png");

    // Load template and user photo
    const [template, uploadedPhoto] = await Promise.all([
      loadImage(templatePath),
      loadImage(req.file.path)
    ]);

    // Create canvas
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Draw template
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // Place uploaded photo (adjust x, y, width, height)
    ctx.drawImage(uploadedPhoto, 644.5 , 1253.2353 , 350, 400);

    // Add user name
    ctx.font = "40px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(userName, 648.938, 1667.4336);

    // Convert canvas to Buffer (No need to save locally)
    const buffer = canvas.toBuffer("image/png");

    // Upload Buffer directly to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload_stream(
      { folder: "posters" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ success: false, message: "Upload failed" });
        }

        // Delete local uploaded file
        fs.unlinkSync(req.file.path);

        // Send URL to frontend
        res.json({ success: true, url: result.secure_url });
      }
    );

    uploadResponse.end(buffer);

  } catch (error) {
    console.error("Error generating poster:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
