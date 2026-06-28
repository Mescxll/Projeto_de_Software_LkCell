"use client";

import { useRouter } from "next/navigation";
import {
  Boxes,
  AlertTriangle,
  MapPin,  
  PackageX,
} from "lucide-react";

export default function EstoqueIndicadores({ dados, onClickAlertas }) {
  const router = useRouter();

  const cards = [
    {
      titulo: "Produtos cadastrados no Estoque",
      valor: dados.itensCadastrados,
      icone: Boxes,
      cor: "azul",
      onClick: () => router.push("/catalogo/produto/gerenciar"),
    },
    {
      titulo: "Produtos sem estoque inicial",
      valor: dados.semEstoque ?? 0,
      icone: PackageX,
      cor: dados.semEstoque > 0 ? "ambar" : "cinza",
      onClick:
        dados.semEstoque > 0 ? () => router.push("/estoque/cadastrar") : null,
    },
    {
      titulo: "Abaixo do mínimo",
      valor: dados.abaixoDoMinimo,
      icone: AlertTriangle,
      cor: "ambar",
      onClick: onClickAlertas,
    },
    {
      titulo: "Localizações ativas",
      valor: dados.localizacoesAtivas,
      icone: MapPin,
      cor: "verde",
      onClick: null,
    },
    //  Implementação Futura
    // {
    //   titulo: "Movimentos hoje",
    //   valor: dados.movimentosHoje ?? "—",
    //   icone: ArrowLeftRight,
    //   cor: "cinza",
    //   onClick: null,
    // },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const isAzul = card.cor === "azul";
        const isAmbar = card.cor === "ambar";
        const isVerde = card.cor === "verde";

        const corBarra = isAzul
          ? "bg-blue-600/80"
          : isAmbar
            ? "bg-amber-600/80"
            : isVerde
              ? "bg-green-700/80"
              : "bg-gray-400";

        const corIcone = corBarra;

        const corValor = isAmbar ? "text-amber-600" : "text-gray-800";

        return (
          <div
            key={card.titulo}
            onClick={card.onClick ?? undefined}
            className={`bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm ${
              card.onClick
                ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                : ""
            }`}
          >
            <div className={`h-1 ${corBarra}`} />
            <div className="p-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3 ${corIcone}`}
              >
                <card.icone className="w-5 h-5" strokeWidth={2} />
              </div>
              <p className="text-xs text-gray-400 mb-0.5">{card.titulo}</p>
              <p className={`text-2xl font-semibold ${corValor}`}>
                {card.valor}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
