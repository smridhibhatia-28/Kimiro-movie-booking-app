import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import Login from "./Login";
import Signup from "./SignUp";
import { useAuth } from "../context/AuthContext"; // adjust path

const Navbar = () => {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const { user, logout } = useAuth();

  useEffect(() => {
    if (!navigator?.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          const apiKey = "329da1b31b704b9f8e82de5d9e802c66";
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}&language=en`
          );
          const data = await res.json();

          const place = data.results?.[0]?.components || {};
          setCity(place.city || place.town || place.village || "Unknown");
          setState(place.state || "");
        } catch (err) {
          console.error("Location fetch failed:", err);
        }
      },
      () => {
        console.error("User denied location access");
      }
    );
  }, []);

  return (
    <>
      <nav className="bg-white flex flex-row justify-between items-center px-4 py-3 shadow-sm fixed top-0 left-0 right-0 z-50">
        {/* Left side: Logo + Location */}
        <div className="flex flex-row items-center space-x-3">
          <img
            className="h-10 w-10 object-cover"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREP1yM-modISpa2F6_8DfQoX9mUhFav8tlmg&s"
            alt="logo"
          />
          <span className="h-6 w-px bg-gray-300"></span>
          <MapPin className="text-purple-600" />
          <div className="flex flex-col leading-4 ml-1">
            <h2 className="font-semibold text-[15px]">{city || "Agra"}</h2>
            <p className="text-[12px] text-gray-500">{state || "Uttar Pradesh"}</p>
          </div>
        </div>

        {/* Middle Nav Links (unchanged) */}
        <div className="hidden md:flex flex-row gap-x-8 font-medium text-[15px] items-center opacity-80">
          <h2 className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">For you</h2>
          <h2 className="text-gray-700">Dining</h2>
          <h2 className="text-gray-700">Events</h2>
          <h2 className="text-gray-700">Movies</h2>
          <h2 className="text-gray-700">Activities</h2>
        </div>

        {/* Right Side: Login & Sign Up */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-right">
                <div className="text-sm text-gray-700">
                  Hi, <span className="font-semibold">{user.name?.split(" ")[0] ?? user.name}</span>
                </div>
                <div className="text-xs text-gray-500">Welcome back</div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setIsSignupOpen(true)}
                className="px-4 py-2 text-sm rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Modals */}
      {isLoginOpen && !user && <Login onClose={() => setIsLoginOpen(false)} />}
      {isSignupOpen && !user && <Signup onClose={() => setIsSignupOpen(false)} />}
    </>
  );
};

export default Navbar;
