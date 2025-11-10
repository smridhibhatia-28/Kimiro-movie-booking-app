// src/pages/MovieDetail.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Share2, Play, Ticket } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { gsap } from "gsap";

/* -------------------- TMDB API config -------------------- */
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY || "";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/original";
const TMDB_POSTER = "https://image.tmdb.org/t/p/w600_and_h900_bestv2";

/* -------------------- Helper fetch functions -------------------- */
async function fetchTMDBMovie(tmdbId) {
  if (!TMDB_KEY) throw new Error("TMDB API key missing. Set VITE_TMDB_KEY in .env");
  const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`);
  if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`);
  return res.json();
}

async function fetchTMDBVideos(tmdbId) {
  if (!TMDB_KEY) return [];
  const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}/videos?api_key=${TMDB_KEY}&language=en-US`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

/* -------------------- Component -------------------- */
export default function MovieDetail() {
  const { id: tmdbId } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const posterRef = useRef(null);
  const contentRef = useRef(null);
  const shareRef = useRef(null);

  /* -------------------- Fetch TMDB data -------------------- */
  useEffect(() => {
    if (!tmdbId) return;
    setLoading(true);

    Promise.all([fetchTMDBMovie(tmdbId), fetchTMDBVideos(tmdbId)])
      .then(([data, vids]) => {
        setMovie({
          id: String(data.id),
          title: data.title || data.original_title,
          durationMins: data.runtime || 0,
          rating: data.vote_average ? data.vote_average.toFixed(1) : "N/A",
          desc: data.overview || "",
          poster_path: data.poster_path || null,
          backdrop_path: data.backdrop_path || data.poster_path || null,
          genres: (data.genres || []).map((g) => g.name),
          releaseDate: data.release_date || "",
        });
        setVideos(vids);
      })
      .catch((err) => {
        console.error("TMDB fetch error:", err);
        setError("Failed to load movie details.");
      })
      .finally(() => setLoading(false));
  }, [tmdbId]);

  /* -------------------- GSAP Animations -------------------- */
  useEffect(() => {
    if (!movie) return;

    const poster = posterRef.current;
    const content = contentRef.current;
    const share = shareRef.current;

    const tl = gsap.timeline();
    if (poster)
      tl.fromTo(
        poster,
        { y: 20, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" },
        0
      );
    if (content)
      tl.fromTo(
        content,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        0.15
      );
    if (share)
      tl.fromTo(share, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, 0.3);

    // poster hover effect
    const hoverIn = () =>
      gsap.to(poster, { scale: 1.03, boxShadow: "0 20px 50px rgba(147,51,234,0.25)", duration: 0.4 });
    const hoverOut = () =>
      gsap.to(poster, { scale: 1, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", duration: 0.4 });

    poster?.addEventListener("mouseenter", hoverIn);
    poster?.addEventListener("mouseleave", hoverOut);

    return () => {
      poster?.removeEventListener("mouseenter", hoverIn);
      poster?.removeEventListener("mouseleave", hoverOut);
      tl.kill();
    };
  }, [movie]);

  /* -------------------- Trailer & Share -------------------- */
  const trailer =
    videos.find((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")) ||
    videos[0];

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: movie?.title || "Movie", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (e) {
      console.error("Share failed", e);
    }
  };

  /* -------------------- UI -------------------- */
  if (loading) return <div className="p-10 text-center text-gray-600">Loading movie…</div>;
  if (error) return <div className="p-10 text-center text-rose-600">{error}</div>;
  if (!movie) return <div className="p-10 text-center text-gray-500">Movie not found</div>;

  const posterUrl = movie.poster_path
    ? `${TMDB_POSTER}${movie.poster_path}`
    : `https://placehold.co/300x420/ddd/333?text=${encodeURIComponent(movie.title)}`;

  const backdropUrl = movie.backdrop_path
    ? `${TMDB_IMG_BASE}${movie.backdrop_path}`
    : posterUrl;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 text-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Blur */}
        <div
          aria-hidden
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(99,102,241,0.15), rgba(236,72,153,0.05)), url(${backdropUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(14px) saturate(0.9)",
            transform: "scale(1.04)",
          }}
          className="absolute inset-0 -z-10"
        />

        <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Poster + CTA */}
            <div className="flex-shrink-0" ref={posterRef}>
              <div
                tabIndex={0}
                className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-purple-200"
                style={{ width: 256 }}
              >
                <div className="relative">
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="block w-full h-auto object-cover"
                  />

                  {/* Trailer Button */}
                  <button
                    onClick={() =>
                      trailer
                        ? setTrailerOpen(true)
                        : alert("Trailer not available for this movie")
                    }
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2 bg-white/90 hover:bg-white px-3 py-2 rounded-full shadow-lg transition"
                    aria-label="Play trailer"
                  >
                    <Play className="w-4 h-4 text-pink-600" />
                    <span className="text-sm font-semibold text-gray-900">Trailer</span>
                  </button>

                  {/* Label */}
                  <div className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-white/90 to-transparent py-2 text-center text-xs text-gray-700">
                    In cinemas
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate(`/movie/${movie.id}/book`)}
                  className="w-64 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold px-5 py-3 rounded-xl shadow transition"
                >
                  <Ticket className="w-4 h-4" /> Book tickets
                </button>
              </div>
            </div>

            {/* Right: Movie Info */}
            <div ref={contentRef} className="flex-1">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                    {movie.title}
                  </h1>

                  <div className="mt-4 flex items-center gap-4">
                    <div className="rounded-md bg-white px-3 py-1 inline-flex items-center gap-2 shadow">
                      <span className="text-purple-600 font-bold">{movie.rating}</span>
                      <span className="text-sm text-gray-600">
                        ({movie.genres?.slice(0, 2).join(", ") || "—"})
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-3">
                      <div className="px-3 py-1 rounded bg-white/40">2D</div>
                      <div className="px-3 py-1 rounded bg-white/40">
                        {movie.releaseDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <div className="ml-auto" ref={shareRef}>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 shadow hover:scale-105 transition"
                    title="Share movie"
                  >
                    <Share2 className="w-4 h-4 text-gray-900" />
                    <span className="text-sm font-medium text-gray-900">
                      {copied ? "Copied!" : "Share"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {movie.durationMins ? `${movie.durationMins} mins` : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎬</span>
                  <span>Cinema</span>
                </div>
              </div>

              <p className="mt-6 text-gray-700 max-w-3xl leading-relaxed">
                {movie.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setTrailerOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-4xl bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {trailer && trailer.site === "YouTube" ? (
              <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-2xl">
                <iframe
                  title="Trailer"
                  src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="rounded-lg bg-white p-8 text-center">
                <p className="mb-4">Trailer not available for this movie.</p>
                <button
                  onClick={() => setTrailerOpen(false)}
                  className="px-4 py-2 rounded bg-gray-800 text-white"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
