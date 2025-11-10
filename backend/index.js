import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";


import authRoutes from "./auth/routes/auth.routes.js";
import { requireAuth } from "./auth/middleware/auth.js";
import User from "./auth/models/User.js";
dotenv.config();


const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "*",
  credentials: true
}));
app.use(express.json());

async function connectDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("Mongo connected");
}
connectDb().catch(err => {
  console.error("Mongo connect error:", err);
  process.exit(1);
});

app.use("/api/auth", authRoutes);

// ---- DEMO DATA ----
const movies = [
  {
    id: "m1",
    title: "Inception",
    rating: "PG-13",
    durationMins: 148,
    poster: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
    overview: "A thief who enters dreams to steal secrets must pull off an impossible inception."
  },
  {
    id: "m2",
    title: "Interstellar",
    rating: "PG-13",
    durationMins: 169,
    poster: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    overview: "Explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: "m3",
    title: "Dune: Part Two",
    rating: "PG-13",
    durationMins: 166,
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    overview: "Paul Atreides unites with the Fremen to wage war against House Harkonnen."
  },
  {
    id: "m4",
    title: "Oppenheimer",
    rating: "R",
    durationMins: 180,
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    overview: "The story of J. Robert Oppenheimer and the creation of the atomic bomb."
  },
  {
    id: "m5",
    title: "Spider-Verse",
    rating: "PG",
    durationMins: 140,
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    overview: "Miles Morales catapults across the Multiverse, encountering a team of Spider-People."
  }
];



const showtimes = [
  { id: "s1", movieId: "m1", startsAt: "2025-11-03T15:00:00Z", screen: "Screen 1", price: 250 },
  { id: "s2", movieId: "m1", startsAt: "2025-11-03T19:00:00Z", screen: "Screen 2", price: 300 },
  { id: "s3", movieId: "m2", startsAt: "2025-11-03T17:00:00Z", screen: "Screen 3", price: 280 },
  { id: "s4", movieId: "m3", startsAt: "2025-11-03T21:00:00Z", screen: "IMAX",    price: 450 },

  { id: "s5", movieId: "m4", startsAt: "2025-11-03T16:30:00Z", screen: "Screen 4", price: 320 },
  { id: "s6", movieId: "m4", startsAt: "2025-11-03T20:30:00Z", screen: "Screen 2", price: 360 },

  { id: "s7", movieId: "m5", startsAt: "2025-11-03T18:15:00Z", screen: "Screen 1", price: 220 },
  { id: "s8", movieId: "m5", startsAt: "2025-11-03T22:00:00Z", screen: "Screen 3", price: 240 },
];


// Build a simple seat map: rows A–D, seats 1–10 for each showtime
const buildSeats = (showtimeId) => {
  const rows = ["A","B","C","D"];
  const seats = [];
  for (const r of rows) {
    for (let n = 1; n <= 10; n++) {
      seats.push({ id: `${r}${n}`, reserved: false, showtimeId });
    }
  }
  return seats;
};

// Seat maps per showtime
const seatMaps = {
  s1: buildSeats("s1"),
  s2: buildSeats("s2"),
  s3: buildSeats("s3"),
  s4: buildSeats("s4"),
};

// Store bookings in memory
const bookings = []; // { id, showtimeId, seats: ["A1","A2"], name, phone, createdAt }

// ---- ENDPOINTS ----

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// List movies
app.get("/api/movies", (req, res) => {
  res.json(movies);
});

// List showtimes (optionally filter by movieId)
app.get("/api/showtimes", (req, res) => {
  const { movieId } = req.query;
  const list = movieId ? showtimes.filter(s => s.movieId === movieId) : showtimes;
  res.json(list);
});

// Get seats for a showtime
app.get("/api/seats", (req, res) => {
  const { showtimeId } = req.query;
  if (!showtimeId || !seatMaps[showtimeId]) {
    return res.status(400).json({ error: "Invalid or missing showtimeId" });
  }
  res.json(seatMaps[showtimeId]);
});
//verify that a token from signup/login works correctly

app.get("/api/users/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
});
// Create a booking (reserve seats)
app.post("/api/bookings", (req, res) => {
  const { showtimeId, seats: seatIds, name, phone } = req.body || {};
  if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: "showtimeId and seats[] required" });
  }
  if (!seatMaps[showtimeId]) {
    return res.status(400).json({ error: "Invalid showtimeId" });
  }

  const seatMap = seatMaps[showtimeId];

  // Validate seat availability
  for (const id of seatIds) {
    const seat = seatMap.find(s => s.id === id);
    if (!seat) return res.status(400).json({ error: `Seat ${id} not found` });
    if (seat.reserved) return res.status(409).json({ error: `Seat ${id} already reserved` });
  }

  // Reserve seats
  for (const id of seatIds) {
    const seat = seatMap.find(s => s.id === id);
    seat.reserved = true;
  }

  const booking = {
    id: `b_${Date.now()}`,
    showtimeId,
    seats: seatIds,
    name: name || "Guest",
    phone: phone || "",
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  res.status(201).json(booking);
});

// (Optional) list bookings for debugging
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

console.log("Has RESEND_API_KEY?", !!process.env.RESEND_API_KEY);
