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
  origin: "https://frontend-chi-liart.vercel.app", // ✅ your deployed frontend
  methods: ["GET", "POST"], // ✅ should be an array
  allowedHeaders: ["Content-Type"] // ✅ should also be an array
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
    const templatePath = path.join(__dirname, "templates", "poster-template.jpg");

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
    // ctx.drawImage(uploadedPhoto, 350 , 514.5173 , 380, 380);

// Function to draw rounded image with glow
function drawRoundedImage(ctx, image, x, y, width, height, radius = 30) {
  ctx.save();

  // Glow effect
  ctx.shadowColor = "rgba(4, 7, 8, 0.6)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // Rounded corners
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
}

// Replace this:
drawRoundedImage(ctx, uploadedPhoto, 350, 514.5173, 380, 380);





    // Add user name
    ctx.font = "bold 40px Poppins";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(userName, 540 , 478.2647  );

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
