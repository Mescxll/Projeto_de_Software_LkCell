"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import { useGerenciarCatalogo } from "@/hooks/catalogo/useGerenciarCatalogo";

export default function Catalogo() {
  const router = useRouter();
  const { painel } = useGerenciarCatalogo();

  return (
    <>
      <Navbar />
      <main className="p-8 px-55 min-h-screen bg-[#f8f9fa]">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl text-gray-800">Catálogo</h1>
          <p className="font-light text-gray-500">
            Gerencie a estrutura de produtos do sistema
          </p>
        </div>
        <br />
        <br />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {painel.map((card, index) => {
            const isAzul = card.cor === "azul";
            const corFundoIcone = isAzul ? "bg-blue-600/80" : "bg-green-700/80";
            const corBordaTopo = isAzul ? "bg-blue-600/80" : "bg-green-700/80";
            const sombraGlow = isAzul
              ? "shadow-blue-600/20 hover:shadow-blue-600/50"
              : "shadow-green-700/20 hover:shadow-green-700/50";

            return (
              <Link href={card.link || "#"} key={index}>
                <div
                  title={card.tooltip}
                  className={`relative bg-white rounded-xl p-6 flex flex-col gap-4 overflow-hidden border cursor-pointer shadow-xl ${sombraGlow} transition-all duration-300 hover:-translate-y-1 ${
                    card.destaque ? "border-2 border-blue-400" : "border-gray-100"
                  }`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 ${corBordaTopo}`}></div>
                  <span className="absolute top-4 right-5 text-xs font-medium text-gray-300">
                    {card.numero}
                  </span>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${corFundoIcone}`}
                  >
                    <card.icone className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-gray-800 font-semibold text-base">
                      {card.titulo}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Gerenciar</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}