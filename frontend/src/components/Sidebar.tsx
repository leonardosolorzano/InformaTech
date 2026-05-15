import { CATEGORIES } from "../types";

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function Sidebar({ selectedCategory, onSelectCategory }: Props) {
  return (
    <aside className="w-64 bg-white border-r border-border p-5 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Categorías
      </h2>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full text-left px-3 py-2 text-sm transition ${
              selectedCategory === null
                ? "bg-primary text-white font-medium"
                : "text-gray-700 hover:bg-muted"
            }`}
          >
            Todos los artículos
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => onSelectCategory(cat)}
              className={`w-full text-left px-3 py-2 text-sm transition ${
                selectedCategory === cat
                  ? "bg-primary text-white font-medium"
                  : "text-gray-700 hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
