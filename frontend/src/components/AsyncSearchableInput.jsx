"use client";
import { useRef } from "react";
import { Search, X } from "lucide-react";

/**
 * AsyncSearchableInput — campo de texto livre com sugestões vindas de uma API
 *
 * Diferente do SearchableSelect, aqui o usuário pode digitar livremente
 * (inclusive valores novos que não existem ainda no banco).
 * As sugestões são controladas externamente pelo hook via `sugestoes` prop.
 *
 * Props:
 *   name          → string  (nome do campo no form)
 *   value         → string  (valor atual do campo)
 *   onChange      → (e: Event) => void  (mesmo padrão do handleChange original)
 *   onSelect      → (item: object) => void  (ao clicar numa sugestão)
 *   sugestoes     → array de objetos vindos da API
 *   renderLabel   → (item) => string  (texto principal da sugestão)
 *   renderSub     → (item) => string | null  (texto secundário opcional)
 *   placeholder   → string
 *   icon          → ReactNode
 *   disabled      → boolean
 *   dropdownRef   → ref externo que engloba o grupo (para fechar ao clicar fora)
 */
export default function AsyncSearchableInput({
  name,
  value,
  onChange,
  onSelect,
  sugestoes = [],
  renderLabel,
  renderSub,
  placeholder = "",
  icon,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const inputClass = `
    w-full py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800
    focus:ring-2 focus:ring-blue-500 outline-none transition-all
    ${icon ? "pl-9 pr-8" : "px-4"}
    ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100" : "bg-white"}
  `;

  return (
    <div className="relative w-full">
      {/* Ícone à esquerda */}
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none">
          {icon}
        </span>
      )}

      {/* Input de texto livre */}
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClass}
      />

      {/* Botão limpar */}
      {value && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onChange({ target: { name, value: "" } })}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Dropdown de sugestões */}
      {sugestoes.length > 0 && (
        <div className="absolute top-full mt-1.5 z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          {/* Indicador de busca */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 bg-gray-50">
            <Search className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
              Sugestões ({sugestoes.length})
            </span>
          </div>

          <ul className="max-h-52 overflow-y-auto py-1">
            {sugestoes.map((item, idx) => {
              const label = renderLabel(item);
              const sub = renderSub?.(item);
              const highlighted = highlight(label, value);

              return (
                <li key={item.id ?? idx}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {highlighted}
                    </p>
                    {sub && (
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Dica: valor livre é permitido */}
          <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400">
              Selecione uma sugestão ou continue digitando para criar novo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Destaca as letras que batem com o search */
function highlight(label, search) {
  if (!search || !label) return label;
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
