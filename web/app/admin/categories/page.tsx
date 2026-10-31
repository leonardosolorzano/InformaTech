"use client";

import { CategoryForm } from "@/components/admin/categories/category-form";
import { CategoryList } from "@/components/admin/categories/category-list";
import { FormMessage } from "@/components/shared/form-message";
import { useCategories } from "@/hooks/use-categories";
import type { CategoryRead } from "@/lib/types";

export default function AdminCategoriesPage() {
  const {
    categories,
    loading,
    error,
    busy,
    editingId,
    name,
    description,
    setName,
    setDescription,
    handleSubmit,
    remove,
    startEdit,
    resetForm,
  } = useCategories();

  function handleRemove(category: CategoryRead) {
    if (!window.confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    void remove(category);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight">Categorías</h1>
        <p className="mt-1 text-sm text-[#686860]">
          Organiza el contenido del portal creando y editando categorías.
        </p>
      </header>

      {error && <FormMessage tone="error">{error}</FormMessage>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <CategoryForm
          editingId={editingId}
          name={name}
          description={description}
          busy={busy}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onCancelEdit={resetForm}
          onSubmit={handleSubmit}
        />

        <CategoryList
          categories={categories}
          loading={loading}
          onEdit={startEdit}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}
