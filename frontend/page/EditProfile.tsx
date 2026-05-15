import { useState, useRef } from "react";
import { useAuth } from "../src/context/AuthContext";
import { BASE_URL, imageUrl } from "../src/api";

export default function EditProfile() {
  const { user, token } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !user) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const body: Record<string, string> = {};
      if (fullName !== user.full_name) body.full_name = fullName;
      if (email !== user.email) body.email = email;
      if (username !== user.username) body.username = username;
      if (password) body.password = password;

      if (Object.keys(body).length === 0) {
        setMessage("No hay cambios que guardar.");
        return;
      }

      const res = await fetch(`${BASE_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Error al actualizar perfil");
      }

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMessage("Perfil actualizado correctamente.");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!token || !user) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BASE_URL}/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Error al subir avatar");
      }

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setAvatarPreview(null);
      setMessage("Avatar actualizado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    handleAvatarUpload(file);
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Inicia sesión para editar tu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Editar Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Actualiza tu información personal</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 mb-6 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-border p-6 mb-6">
        <label className="block text-sm font-medium text-primary mb-3">Foto de perfil</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-muted border border-border overflow-hidden flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : user.image_url ? (
              <img src={imageUrl(user.image_url)} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-gray-400">
                {user.full_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-primary text-white text-sm font-medium hover:bg-primary-light transition disabled:opacity-50"
            >
              {uploading ? "Subiendo..." : "Cambiar foto"}
            </button>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG. Máximo 300x300px</p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Nombre Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-white text-primary outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-white text-primary outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-white text-primary outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Nueva Contraseña (opcional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-border bg-white text-primary outline-none focus:border-primary transition"
              placeholder="Dejar en blanco para mantener la actual"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
