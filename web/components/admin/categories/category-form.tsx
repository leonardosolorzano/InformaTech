"use client";

import type { FormEvent } from "react";
import { Plus, X } from "lucide-react";

import { Field } from "@/components/shared/field";
import { SubmitButton } from "@/components/shared/submit-button";
import { inputClassName } from "@/lib/styles";

interface CategoryFormProps {
  editingId: number | null;
  name: string;
  description: string;
  busy: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onCancelEdit: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

/** Alta y edición de categorías. */
export function CategoryForm({
  editingId,
  name,
  description,
  busy,
  onNameChange,
  onDescriptionChange,
  onCancelEdit,
  onSubmit,
}: CategoryFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 self-start rounded-2xl border border-black/10 bg-white p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {editingId ? "Editar categoría" : "Nueva categoría"}
        </h2>
        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#686860] hover:text-[#171717]"
          >
            <X className="size-3" />
            Cancelar
          </button>
        )}
      </div>

      <Field htmlFor="cat-name" label="Nombre">
        <input
          id="cat-name"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={inputClassName}
          placeholder="Inteligencia Artificial"
        />
      </Field>

      <Field htmlFor="cat-desc" label="Descripción">
        <textarea
          id="cat-desc"
          maxLength={1000}
          rows={4}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={inputClassName}
          placeholder="Descripción breve (opcional)"
        />
      </Field>

      <SubmitButton
        loading={busy}
        label={editingId ? "Guardar cambios" : "Crear categoría"}
        icon={Plus}
        className="w-full"
      />
    </form>
  );
}
