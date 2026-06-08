"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";

/**
 * SearchableSelect — combobox com busca inline
 *
 * Props:
 *   options      → [{ value, label }]
 *   value        → valor selecionado (string)
 *   onChange     → (value: string) => void
 *   placeholder  → string  (ex: "Selecione um cliente")
 *   icon         → ReactNode (ícone à esquerda, opcional)
 *   disabled     → boolean
 *   name         → string  (para acessibilidade)
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Selecione...",
  icon,
  disabled = false,
  name,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Foca no input ao abrir
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSelect = (opt) => {
    onChange(String(opt.value));
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full" aria-haspopup="listbox">
      {/* Trigger */}
      <button
        type="button"
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`
          w-full flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm text-left transition-all outline-none
          ${disabled
            ? "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
            : open
            ? "border-blue-500 ring-2 ring-blue-500 bg-white"
            : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
          }
        `}
      >
        {/* Ícone à esquerda */}
        {icon && (
          <span className="shrink-0 text-gray-400 w-4 h-4 flex items-center justify-center">
            {icon}
          </span>
        )}

        {/* Label */}
        <span className={`flex-1 truncate ${!selected ? "text-gray-400" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>

        {/* Botão limpar */}
        {selected && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => e.key === "Enter" && handleClear(e)}
            className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Campo de busca */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-300 bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-300 hover:text-gray-500"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Lista */}
          <ul
            role="listbox"
            className="max-h-52 overflow-y-auto py-1"
          >
            {/* Opção vazia */}
            <li
              role="option"
              aria-selected={!value}
              onClick={() => handleSelect({ value: "", label: "" })}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors text-gray-400 hover:bg-gray-50 ${
                !value ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              {placeholder}
            </li>

            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">
                Nenhum resultado encontrado
              </li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={String(opt.value) === String(value)}
                  onClick={() => handleSelect(opt)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                    String(opt.value) === String(value)
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {highlight(opt.label, search)}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Destaca as letras que batem com o search */
function highlight(label, search) {
  if (!search) return label;
  const idx = label.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return label;
  return (
    <>
      {label.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-800 rounded px-0.5">
        {label.slice(idx, idx + search.length)}
      </mark>
      {label.slice(idx + search.length)}
    </>
  );
}