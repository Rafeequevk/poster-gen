import { useState, useCallback } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import { saveAs } from "file-saver";
import getCroppedImg from "./utils/cropImage"; // Utility function we'll define below

function App() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [posterURL, setPosterURL] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setShowCropper(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !photo) {
      setError("Please enter your name and upload a photo.");
      return;
    }

    setLoading(true);

    try {
      // Crop the image before sending
      const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("photo", croppedBlob, "cropped.jpg");

      const response = await axios.post(
        "https://poster-gen.onrender.com/generate-poster",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        setPosterURL(response.data.url);
        setShowCropper(false);
      } else {
        setError("Poster generation failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error generating poster. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPoster = () => {
    saveAs(posterURL, "poster.jpg");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h1>Create Your Poster</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />

        {showCropper && preview && (
          <div style={{ position: "relative", width: "100%", height: 300 }}>
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Poster"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {posterURL && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Your Poster</h2>
          <img src={posterURL} alt="Generated Poster" style={{ width: "100%", borderRadius: "8px" }} />
          <button onClick={downloadPoster} style={{ marginTop: "1rem" }}>
            Download Poster
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
