import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Users, UserCog, Package, Truck, TrendingUp, ShoppingBasket, Wrench, Wallet, Boxes } from "lucide-react";

const painel = [
  { titulo: "Clientes", icone: Users, cor: "azul", link: "/clientes/gerenciar"},
  { titulo: "Funcionários", icone: UserCog, cor: "verde", link: "/funcionarios/gerenciar"},
  { titulo: "Produtos", icone: Package, cor: "cinza" },
  { titulo: "Fornecedores", icone: Truck, cor: "cinza" },
  { titulo: "Vendas", icone: TrendingUp, cor: "cinza" },
  { titulo: "Compras", icone: ShoppingBasket, cor: "cinza" },
  { titulo: "Ordens de Serviço", icone: Wrench, cor: "cinza" },
  { titulo: "Despesas", icone: Wallet, cor: "cinza" },
  { titulo: "Estoque", icone: Boxes, cor: "cinza" },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="p-8 px-55 min-h-screen bg-[#f8f9fa]">
        <h1 className="text-2xl text-gray-800">Bem-vindo ao LkCell</h1>        
        <p className="font-light text-gray-500">Acesse o módulo que deseja gerenciar</p>
        <br/><br/>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {painel.map((card, index) => {
            const isAzul = card.cor === "azul";
            const isCinza = card.cor === "cinza";
            const corFundoIcone = isAzul ? "bg-blue-600/80" : isCinza ? "bg-gray-400" : "bg-green-700/80";
            const corBordaTopo = isAzul ? "bg-blue-600/80" : isCinza ? "bg-gray-400" : "bg-green-700/80";
            const sombraGlow = isAzul ? "shadow-blue-600/20 hover:shadow-blue-600/50" 
              : isCinza ? "shadow-gray-400/20 hover:shadow-gray-400/50" 
              : "shadow-green-700/20 hover:shadow-green-700/50";

            return (
              <Link href={card.link || "#"} key={index}>
                <div className={`relative bg-white rounded-xl p-6 flex flex-col gap-4 overflow-hidden border border-gray-100 cursor-pointer shadow-xl ${sombraGlow} transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`absolute top-0 left-0 w-full h-1 ${corBordaTopo}`}></div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${corFundoIcone}`}>
                    <card.icone className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-gray-800 font-semibold text-base">{card.titulo}</h3>
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