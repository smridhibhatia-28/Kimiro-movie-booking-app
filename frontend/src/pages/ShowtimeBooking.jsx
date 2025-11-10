// src/pages/ShowtimeBooking.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, IndianRupee, Ticket } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { gsap } from "gsap";

export default function ShowtimeBooking() {
  const { id: tmdbId } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState("");
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // backend fallback
  const BACKEND = {
    getShowtimes: async () => {
      const now = Date.now();
      return [
        { id: `${tmdbId}-st-1`, startsAt: new Date(now + 2 * 3600e3), screen: "Screen 1 (IMAX)", price: 220 },
        { id: `${tmdbId}-st-2`, startsAt: new Date(now + 4 * 3600e3), screen: "Screen 2", price: 180 },
        { id: `${tmdbId}-st-3`, startsAt: new Date(now + 6 * 3600e3), screen: "Screen 3", price: 150 },
      ];
    },
    getSeats: async (showtimeId) => {
      const seats = [];
      const rows = ["A", "B", "C", "D", "E"];
      const reservedKey = `__reserved_${showtimeId}`;
      const reservedSet = new Set(JSON.parse(localStorage.getItem(reservedKey) || "[]"));
      for (const r of rows) {
        for (let i = 1; i <= 10; i++) {
          const id = `${r}${i}`;
          seats.push({ id, reserved: reservedSet.has(id) });
        }
      }
      return seats;
    },
    createBooking: async ({ showtimeId, seats, user }) => {
      const reservedKey = `__reserved_${showtimeId}`;
      const prev = new Set(JSON.parse(localStorage.getItem(reservedKey) || "[]"));
      seats.forEach((s) => prev.add(s));
      localStorage.setItem(reservedKey, JSON.stringify([...prev]));
      return { id: `b-${Math.random().toString(36).slice(2, 9)}`, showtimeId, seats };
    },
  };

  // animations
  useEffect(() => {
    gsap.from(".showtime-btn", { opacity: 0, y: 20, stagger: 0.05, duration: 0.5, ease: "power3.out" });
  }, [showtimes]);

  useEffect(() => {
    BACKEND.getShowtimes().then(setShowtimes);
  }, []);

  useEffect(() => {
    if (selectedShowtime) BACKEND.getSeats(selectedShowtime).then(setSeats);
  }, [selectedShowtime]);

  const toggleSeat = (id) =>
    setSelectedSeats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleBooking = async () => {
    if (!user) return openAuthModal?.("login");
    const booking = await BACKEND.createBooking({ showtimeId: selectedShowtime, seats: selectedSeats, user: user?.name });
    alert(`🎟️ Booking confirmed! ID: ${booking.id}`);
    navigate(`/profile`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Select Showtime</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-purple-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {showtimes.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedShowtime(st.id)}
              className={`showtime-btn flex items-center gap-3 px-5 py-3 rounded-full border transition ${
                selectedShowtime === st.id
                  ? "bg-purple-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-purple-50"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {new Date(st.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-gray-400">·</span>
              <span>{st.screen}</span>
              <span className="text-gray-400">·</span>
              <IndianRupee className="w-4 h-4" />
              <span>{st.price}</span>
            </button>
          ))}
        </div>

        {selectedShowtime && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Choose Seats</h2>
            <div className="grid grid-cols-10 gap-2 bg-white p-6 rounded-xl shadow">
              {seats.map((s) => {
                const chosen = selectedSeats.includes(s.id);
                const reserved = s.reserved;
                const base = "px-2 py-2 rounded text-sm text-center font-medium border";
                const cls = reserved
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : chosen
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white hover:bg-purple-50 border-gray-200";
                return (
                  <button
                    key={s.id}
                    disabled={reserved}
                    onClick={() => !reserved && toggleSeat(s.id)}
                    className={`${base} ${cls}`}
                  >
                    {s.id}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold px-5 py-3 rounded-xl shadow"
              >
                <Ticket className="w-5 h-5" />
                {selectedSeats.length > 0 ? `Book (${selectedSeats.length})` : "Book"}
              </button>
              <p className="text-sm text-gray-600">
                Selected: {selectedSeats.join(", ") || "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
