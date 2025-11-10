// src/components/MovieCard.jsx
import React from "react";
import { Clock } from "lucide-react";

/**
 * Props:
 *  - movie: { id, title, durationMins, rating, posterUrl?, desc? }
 *  - onActivate(movie)
 */
export default function MovieCard({ movie, onActivate }) {
  const poster = movie.posterUrl || `https://placehold.co/600x900/111827/ffffff?text=${encodeURIComponent(movie.title)}`;

  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActivate?.(movie);
    }
  };

  return (
    <button
      type="button"
      onClick={() => movie && onActivate?.(movie)}
      onKeyDown={handleKey}
      title={movie.title}
      aria-label={`Open details for ${movie.title}`}
      className="group relative w-full transform rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 hover:-translate-y-1 hover:shadow-lg transition"
    >
      {/* Poster with fixed aspect ratio so all cards match height */}
      <div className="overflow-hidden rounded-t-xl bg-gray-100">
        <div className="relative aspect-[3/4] w-full">
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
          />

          {/* Top-right rating badge */}
          <div className="absolute top-3 right-3 z-10 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold shadow-sm backdrop-blur">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3 h-3 inline-block" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.236 3.8a1 1 0 00.95.69h3.993c.969 0 1.371 1.24.588 1.81l-3.233 2.347a1 1 0 00-.364 1.118l1.236 3.8c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.916 2.493c-.784.57-1.84-.197-1.54-1.118l1.236-3.8a1 1 0 00-.364-1.118L2.219 9.227c-.783-.57-.38-1.81.588-1.81h3.993a1 1 0 00.95-.69l1.236-3.8z" />
              </svg>
              <span>{movie.rating}</span>
            </span>
          </div>

          {/* bottom gradient + title */}
          <div className="absolute left-0 right-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-3 py-3">
            <h3 className="text-sm font-semibold text-white line-clamp-2">{movie.title}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-white/90">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{movie.durationMins ? `${movie.durationMins} mins` : "—"}</span>
              </div>
              <div className="truncate">{movie.desc ? movie.desc.slice(0, 80) : ""}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body (keeps consistent small footer) */}
      <div className="px-3 py-3 text-left">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-medium text-gray-800 truncate">{movie.title}</div>
          <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700 border">{movie.rating}</div>
        </div>
      </div>
    </button>
  );
}
