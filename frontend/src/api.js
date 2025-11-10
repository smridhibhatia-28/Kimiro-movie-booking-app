const API = import.meta.env?.VITE_API_URL || 'http://localhost:3000';

export const getMovies = async () => (await fetch(`${API}/api/movies`)).json();
export const getShowtimes = async (movieId) => (await fetch(`${API}/api/showtimes?movieId=${movieId}`)).json();
export const getSeats = async (showtimeId) => (await fetch(`${API}/api/seats?showtimeId=${showtimeId}`)).json();

export const createBooking = async ({ showtimeId, seats, name, phone }) => {
  const res = await fetch(`${API}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ showtimeId, seats, name, phone })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};
