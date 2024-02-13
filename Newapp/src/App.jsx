import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const CLIENT_ID = "25797ec13639451e880fb50942374fe6";
const REDIRECT_URI = "http://localhost:5173";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const API_BASE_URL = "https://api.spotify.com/v1";
const RESPONSE_TYPE = "token";

function App() {
  const [token, setToken] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const hash = window.location.hash;
      let storedToken = window.localStorage.getItem("token");

      if (!storedToken && hash) {
        storedToken = hash
          .substring(1)
          .split("&")
          .find((elem) => elem.startsWith("access_token"))
          .split("=")[1];
        window.location.hash = "";
        window.localStorage.setItem("token", storedToken);
      }

      setToken(storedToken);
    };

    fetchToken();
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    setToken("");
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchQuery,
          type: "track",
          limit: 10,
        },
      });
      setSearchResults(response.data.tracks.items);
    } catch (error) {
      console.error("Error searching for tracks:", error);
    }
  };

  const handlePlayTrack = (track) => {
    setSelectedTrack(track);
  };

  return (
    <div>
      <h1>Spotify clone</h1>
      {!token ? (
        <a
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
            REDIRECT_URI
          )}&response_type=${RESPONSE_TYPE}`}
        >
          Login to Spotify clone
        </a>
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          <ul>
            {searchResults.map((track) => (
              <li key={track.id}>
                <img src={track.album.images[0].url} alt={track.name} />
                {track.name} - {track.artists[0].name}
                <button onClick={() => handlePlayTrack(track)}>Play</button>
              </li>
            ))}
          </ul>
          {selectedTrack && (
            <div>
              <h2>Now Playing</h2>
              <img
                src={selectedTrack.album.images[0].url}
                alt={selectedTrack.name}
              />
              <iframe
                src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
                width="300"
                height="80"
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
              ></iframe>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
