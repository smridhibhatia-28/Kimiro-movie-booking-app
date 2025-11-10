import { Facebook, Instagram, Twitter, Youtube, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
        {/* Branding */}
        <div className="space-y-2">
          {/* If you added Bebas Neue, this will use it; otherwise falls back gracefully */}
          <h2 className="text-5xl leading-none text-white tracking-tight font-brand select-none" style={{ letterSpacing: "0.02em" }}>
            KIMIRO
          </h2>
          <p className="text-sm text-gray-400">new era of booking</p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 md:justify-center" aria-label="Footer links">
          <a href="#" className="hover:text-white text-sm font-semibold">Terms &amp; Conditions</a>
          <a href="#" className="hover:text-white text-sm font-semibold">Privacy Policy</a>
          <a href="#" className="hover:text-white text-sm font-semibold">Contact Us</a>
          <a href="#" className="hover:text-white text-sm font-semibold">List your events</a>
        </nav>

        {/* Replace QR with a simple CTA (optional) */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="w-full max-w-xs">
            <p className="text-sm text-gray-400">Stay in the loop</p>
            <div className="mt-2 flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-l-md border border-gray-700 bg-zinc-800 px-3 py-2 text-sm placeholder-gray-500 outline-none focus:border-gray-600"
              />
              <button className="rounded-r-md bg-white text-zinc-900 px-3 py-2 text-sm font-semibold hover:brightness-95">
                Notify me
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">No spam. Unsubscribe anytime.</p>
          </div>

          {/* Socials */}
          <div className="flex space-x-4 mt-3" aria-label="Social media">
            <a href="#" aria-label="Message" className="hover:text-white p-1 rounded transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-white p-1 rounded transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-white p-1 rounded transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white p-1 rounded transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-white p-1 rounded transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="text-center text-xs text-gray-500 py-4 px-3">
          By accessing this page, you confirm that you have read, understood, and agreed to our
          Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
