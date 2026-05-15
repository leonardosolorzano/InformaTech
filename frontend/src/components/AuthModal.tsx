import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

interface Props {
  open: boolean;
  defaultTab: "login" | "register";
  onClose: () => void;
}

export default function AuthModal({ open, defaultTab, onClose }: Props) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ username, password });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        username,
        email,
        full_name: fullName,
        password,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t: "login" | "register") {
    setTab(t);
    setError("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex border-b border-border">
          <button
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === "login"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => switchTab("login")}
          >
            Iniciar Sesión
          </button>
          <button
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === "register"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => switchTab("register")}
          >
            Registrarse
          </button>
        </div>

        <div className="p-6">
          {error && (
            <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 p-3">{error}</p>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario o Email
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-border outline-none focus:border-primary transition"
                  placeholder="usuario@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border outline-none focus:border-primary transition"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Iniciar Sesión"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-border outline-none focus:border-primary transition"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-border outline-none focus:border-primary transition"
                  placeholder="juanperez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-border outline-none focus:border-primary transition"
                  placeholder="juan@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border outline-none focus:border-primary transition"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-50"
              >
                {loading ? "Registrando..." : "Crear Cuenta"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
