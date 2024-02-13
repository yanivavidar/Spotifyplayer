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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const hash = window.location.hash;
      let storedToken = window.localStorage.getItem("token");

      if (!storedToken && hash) {
        try {
          storedToken = hash
            .substring(1)
            .split("&")
            .find((elem) => elem.startsWith("access_token"))
            .split("=")[1];
          window.location.hash = "";
          window.localStorage.setItem("token", storedToken);
        } catch (error) {
          setError("Error fetching token");
        }
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
    setLoading(true);
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
      setError("Error searching for tracks");
    }
    setLoading(false);
  };

  const handlePlayTrack = (track) => {
    setSelectedTrack(track);
  };

  return (
    <div className="container">
      <h1>Spotify clone</h1>
      {!token ? (
        <a
          className="login-link"
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
            REDIRECT_URI
          )}&response_type=${RESPONSE_TYPE}`}
        >
          Login to Spotify clone
        </a>
      ) : (
        <>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
          <div className="search-container">
            <input
              className="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}
          <ul className="track-list">
            {searchResults.map((track) => (
              <li className="track-item" key={track.id}>
                <img
                  className="track-image"
                  src={track.album.images[0].url}
                  alt={track.name}
                />
                <div className="track-item-info">
                  <span className="track-name">{track.name}</span> -{" "}
                  {track.artists[0].name}
                  <button
                    className="play-button"
                    onClick={() => handlePlayTrack(track)}
                  >
                    Play
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {selectedTrack && (
            <div className="now-playing-container">
              <h2 className="now-playing-title">Now Playing</h2>
              <img
                className="now-playing-image"
                src={selectedTrack.album.images[0].url}
                alt={selectedTrack.name}
              />
              <iframe
                className="now-playing-iframe"
                src={`https://open.spotify.com/embed/track/${selectedTrack.id}`}
                width="300"
                height="80"
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
                autoPlay="1"
                title="Embedded Spotify Player"
              ></iframe>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
