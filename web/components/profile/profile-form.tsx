"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Field } from "@/components/shared/field";
import { FormMessage } from "@/components/shared/form-message";
import { SubmitButton } from "@/components/shared/submit-button";
import { toErrorMessage } from "@/lib/errors";
import { fetchJson } from "@/lib/http";
import { inputClassName } from "@/lib/styles";
import type { User } from "@/lib/types";

/** Formulario de datos públicos del perfil (nombre y biografía). */
export function ProfileForm({ user }: { user: User }) {
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await fetchJson<{ full_name: string | null; bio: string | null }>(
        "/api/users/me",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: fullName || null, bio: bio || null }),
        }
      );
      setMessage({ ok: true, text: "Perfil actualizado correctamente" });
      await refreshUser();
    } catch (err) {
      setMessage({ ok: false, text: toErrorMessage(err, "Error al guardar") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold">Datos públicos</h2>

      <Field htmlFor="full_name" label="Nombre">
        <input
          id="full_name"
          type="text"
          maxLength={100}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClassName}
          placeholder="Tu nombre"
        />
      </Field>

      <Field htmlFor="bio" label="Biografía">
        <textarea
          id="bio"
          maxLength={1000}
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={inputClassName}
          placeholder="Cuéntanos algo sobre ti"
        />
      </Field>

      {message && (
        <FormMessage tone={message.ok ? "success" : "error"}>
          {message.text}
        </FormMessage>
      )}

      <SubmitButton
        loading={saving}
        label="Guardar cambios"
        loadingLabel="Guardando..."
        icon={CheckCircle2}
        size="sm"
        className="w-fit"
      />
    </form>
  );
}
