"use client";
import { Search, Bell, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Users,
  UserCog,
  Package,
  Truck,
  TrendingUp,
  ShoppingBasket,
  Wrench,
  Wallet,
  Boxes,
  Tag,
  Folder,
  Smartphone,
} from "lucide-react";

const modulos = [
  { titulo: "Clientes", icone: Users, link: "/cliente/gerenciar" },
  { titulo: "Funcionários", icone: UserCog, link: "/funcionario/gerenciar" },
  {
    titulo: "Catálogo",
    icone: Package,
    link: "/catalogo/",
    subitens: [
      { titulo: "Produto", icone: Package, link: "/catalogo/produto/gerenciar" },
      { titulo: "Marca", icone: Tag, link: "/catalogo/marca/gerenciar" },
      { titulo: "Categoria", icone: Folder, link: "/catalogo/categoria/gerenciar" },
      { titulo: "Modelo", icone: Smartphone, link: "/catalogo/modelo/gerenciar" },
    ],
  },
  { titulo: "Fornecedores", icone: Truck, link: "/fornecedor/gerenciar" },
  { titulo: "Vendas", icone: TrendingUp, link: "/venda/gerenciar" },
  { titulo: "Compras", icone: ShoppingBasket, link: "/compra/gerenciar" },
  { titulo: "Ordens de Serviço", icone: Wrench, link: "/ordemServico/gerenciar" },
  { titulo: "Despesas", icone: Wallet, link: "/despesa/gerenciar" },
  { titulo: "Estoque", icone: Boxes, link: "/estoque/gerenciar" },
];

export default function Navbar() {
  const [busca, setBusca] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setBusca("");
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  // Filtra módulos e subitens pelo termo de busca.
  // Um módulo aparece se o próprio título combina (mostrando todos os subitens)
  // ou se algum subitem combina (mostrando só os subitens que combinam).
  const termo = busca.trim().toLowerCase();

  const modulosFiltrados = termo
    ? modulos
        .map((m) => {
          const moduloCombina = m.titulo.toLowerCase().includes(termo);
          const subitensCombinando = m.subitens
            ? m.subitens.filter((s) => s.titulo.toLowerCase().includes(termo))
            : [];

          if (moduloCombina) {
            return { ...m, subitensExibidos: m.subitens ?? [] };
          }
          if (subitensCombinando.length > 0) {
            return { ...m, subitensExibidos: subitensCombinando };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  return (
    <nav className="flex items-center justify-between px-55 py-3 bg-white border-y border-gray-200 relative z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10">
            <img className="rounded-xl w-full h-full object-cover" src="/LK.jpg" alt="Logo LKCell" />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-800 text-sm leading-tight font-bold">LKCell</span>
            <span className="text-gray-500 text-xs font-medium">Negócios</span>
          </div>
        </Link>
      </div>

      {/* Busca com dropdown */}
      <div className="flex-1 max-w-2xl px-8 relative" ref={dropdownRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar Módulo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f4f6f8] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
        </div>

        {/* Dropdown de resultados */}
        {modulosFiltrados.length > 0 && (
          <div className="absolute top-full left-8 right-8 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-96 overflow-y-auto">
            {modulosFiltrados.map((m) => (
              <div key={m.titulo}>
                <Link href={m.link} onClick={() => setBusca("")}>
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <m.icone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{m.titulo}</span>
                  </div>
                </Link>

                {m.subitensExibidos?.length > 0 && (
                  <div className="border-t border-gray-50">
                    {m.subitensExibidos.map((s) => (
                      <Link href={s.link} key={s.titulo} onClick={() => setBusca("")}>
                        <div className="flex items-center gap-3 pl-9 pr-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer">
                          <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                          <s.icone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{s.titulo}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sem resultados */}
        {termo && modulosFiltrados.length === 0 && (
          <div className="absolute top-full left-8 right-8 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
            <span className="text-sm text-gray-400">Nenhum módulo encontrado</span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-5">
        <button className="relative text-gray-600 hover:text-gray-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 right-0 w-2 h-2 bg-green-700 rounded-full border border-white"></span>
        </button>
        <button className="text-gray-600 hover:text-gray-800 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-300"></div>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8">
            <img className="rounded-full" src="/User.jpg" alt="Icone Usuário" />
          </div>
          <span className="text-sm font-medium text-gray-700">Administrador</span>
        </button>
      </div>
    </nav>
  );
}