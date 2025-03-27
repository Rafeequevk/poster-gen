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

    const response = await axios.post("http://localhost:5000/generate-poster", formData);
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

export default App;
