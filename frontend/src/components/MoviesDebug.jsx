// src/components/MoviesDebug.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "./MovieCard";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY || "";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w600_and_h900_bestv2";

export default function MoviesDebug() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!TMDB_KEY) {
      setError("TMDB API key missing. Set VITE_TMDB_KEY in your .env");
      return;
    }

    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`, { signal: ctrl.signal });
        if (!res.ok) throw new Error("TMDB error " + res.status);
        const data = await res.json();
        const mapped = (data.results || []).map((m) => ({
          id: String(m.id),
          title: m.title || m.original_title,
          durationMins: 0, // runtime not in list endpoint; MovieDetail fetches full data
          rating: m.vote_average ? String(m.vote_average.toFixed(1)) : "—",
          posterUrl: m.poster_path ? `${TMDB_IMG_BASE}${m.poster_path}` : null,
          desc: m.overview || "",
        }));
        setMovies(mapped);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("Failed to load movies. Check console for details.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, []);

  const handleActivate = (movie) => navigate(`/movie/${movie.id}`);

  return (
    <div className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Popular movies</h2>
      </div>

      {error ? (
        <div className="p-4 text-center text-red-600">{error}</div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-0 aspect-[3/4] w-full rounded-lg bg-gray-200" />
              <div className="mt-3 h-3 bg-gray-200 rounded w-3/4" />
              <div className="mt-2 h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} onActivate={handleActivate} />
          ))}
        </div>
      )}
    </div>
  );
}
