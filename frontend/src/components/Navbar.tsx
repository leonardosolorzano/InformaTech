import { useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "../types";
import { imageUrl } from "../api";

interface Props {
  user: User | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onOpenLogin, onOpenRegister, onLogout }: Props) {
  const [search, setSearch] = useState("");

  return (
    <nav className="bg-primary text-white h-16 flex items-center px-6 gap-6 sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold tracking-tight whitespace-nowrap">
        InformaTech
      </Link>

      <div className="flex-1 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar artículos..."
          className="w-full max-w-lg px-4 py-2 bg-primary-light text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="p-2 hover:bg-white/10 transition"
              title="Dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            <div className="flex items-center gap-2 text-sm">
              {user.image_url ? (
                <img
                  src={imageUrl(user.image_url)}
                  alt={user.full_name}
                  className="w-8 h-8 object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-white text-primary flex items-center justify-center text-xs font-bold">
                  {user.full_name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <span className="text-white/90 hidden sm:inline">{user.full_name}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-white/10 transition text-white/70 hover:text-white"
              title="Cerrar sesión"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 border border-white/30 hover:bg-white/10 transition"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 bg-white text-primary hover:bg-white/90 transition font-medium"
            >
              Registrarse
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
