// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { User, LogOut, Ticket, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Mock loading from localStorage
    const all = [];
    for (let key in localStorage) {
      if (key.startsWith("__reserved_")) {
        const showtimeId = key.replace("__reserved_", "");
        const seats = JSON.parse(localStorage.getItem(key) || "[]");
        all.push({ showtimeId, seats });
      }
    }
    setBookings(all);
  }, []);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Please log in to view your profile.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-6 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name || "Guest"}</h1>
              <p className="text-gray-500">{user.email || "No email"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-purple-600" />
            Your Bookings
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((b, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-purple-600">Showtime ID: {b.showtimeId}</p>
                    <p className="text-gray-600 text-sm">
                      Seats: {b.seats.join(", ") || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <CalendarDays className="w-4 h-4" />
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
