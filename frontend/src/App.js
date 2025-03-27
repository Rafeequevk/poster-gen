import { useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [posterURL, setPosterURL] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("photo", photo);

    try {
      const response = await axios.post("https://poster-gen.onrender.com/generate-poster", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        setPosterURL(response.data.url); // Set the generated poster URL
      } else {
        setError("Poster generation failed. Try again.");
      }
    } catch (error) {
      setError("Error generating poster. Please check backend.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Create Your Poster</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Enter Name" onChange={(e) => setName(e.target.value)} />
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
        <button type="submit">Generate Poster</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {posterURL && <img src={posterURL} alt="Generated Poster" />}
    </div>
  );
}

export default App;
