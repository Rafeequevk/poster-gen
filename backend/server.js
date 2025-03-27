const express = require("express");
const multer = require("multer");
const { createCanvas, loadImage } = require("canvas");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" }); // Temporary storage

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dzj6a6w7z",
  api_key: "779623744423688",
  api_secret: "9vYnelv85dAo0__7usAVhXrrABo",
});

app.post("/generate-poster", upload.single("image"), async (req, res) => {
  try {
    // Load template
    const template = await loadImage(__dirname + "/templates/poster-template.png");
    const uploadedPhoto = await loadImage(req.file.path);

    // Create canvas with template size
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Draw template
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // Place uploaded photo in predefined area (adjust x, y, width, height)
    ctx.drawImage(uploadedPhoto, 100, 200, 200, 200); 

    // Add name to predefined position
    ctx.font = "40px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("User Name Here", 150, 450); // Adjust x, y position

    // Save the final image
    const outputPath = `uploads/final_poster_${Date.now()}.png`;
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on("finish", async () => {
      // Upload final image to Cloudinary
      const result = await cloudinary.uploader.upload(outputPath, { folder: "posters" });

      // Delete local files
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(outputPath);

      // Send final image URL to frontend
      res.json({ success: true, url: result.secure_url });
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error generating poster", error });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
