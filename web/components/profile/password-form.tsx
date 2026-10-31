"use client";

import { useState, type FormEvent } from "react";

import { Field } from "@/components/shared/field";
import { FormMessage } from "@/components/shared/form-message";
import { SubmitButton } from "@/components/shared/submit-button";
import { toErrorMessage } from "@/lib/errors";
import { fetchJson } from "@/lib/http";
import { inputClassName } from "@/lib/styles";

/** Formulario de cambio de contraseña del perfil. */
export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await fetchJson("/api/users/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      setMessage({ ok: true, text: "Contraseña actualizada correctamente" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage({
        ok: false,
        text: toErrorMessage(err, "Error al cambiar"),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="mt-10 grid gap-5 border-t border-black/[0.07] pt-8"
      onSubmit={handleSubmit}
    >
      <h2 className="text-lg font-bold">Cambiar contraseña</h2>

      <Field htmlFor="current_password" label="Contraseña actual">
        <input
          id="current_password"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputClassName}
        />
      </Field>

      <Field
        htmlFor="new_password"
        label="Nueva contraseña"
        hint="Usa al menos 8 caracteres, una letra y un número."
      >
        <input
          id="new_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,128}"
          title="Debe tener al menos 8 caracteres, una letra y un número."
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClassName}
        />
      </Field>

      {message && (
        <FormMessage tone={message.ok ? "success" : "error"}>
          {message.text}
        </FormMessage>
      )}

      <SubmitButton
        loading={saving}
        label="Cambiar contraseña"
        loadingLabel="Actualizando..."
        variant="outline"
        size="sm"
        className="w-fit"
      />
    </form>
  );
}
