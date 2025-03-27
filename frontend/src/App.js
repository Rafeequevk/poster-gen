import { useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [posterUrl, setPosterUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("photo", photo);

    const response = await axios.post("https://poster-gen.onrender.com/generate-poster", formData);
    setPosterUrl(response.data.posterUrl);
  };

  return (
    <div>
      <h1>Create Your Poster</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Enter Name" onChange={(e) => setName(e.target.value)} />
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
        <button type="submit">Generate Poster</button>
      </form>
      {posterUrl && <img src={posterUrl} alt="Poster" />}
    </div>
  );
}


const [posterURL, setPosterURL] = useState(null);

const handleUpload = async (event) => {
  const formData = new FormData();
  formData.append("image", event.target.files[0]);

  const response = await fetch("https://poster-gen.onrender.com/generate-poster", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data.success) {
    setPosterURL(data.url); // Display final poster
  } else {
    console.error("Upload failed", data.message);
  }
};

return (
  <div>
    <input type="file" onChange={handleUpload} />
    {posterURL && <img src={posterURL} alt="Generated Poster" />}
  </div>
);



export default App;




