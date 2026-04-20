import { Users, UserCog, Package, Truck, TrendingUp, ShoppingBasket, Wrench, Wallet, Boxes, Search, Bell, Settings, User } from "lucide-react";

const painel = [
  { titulo: "Clientes", icone: Users, cor: "azul" },
  { titulo: "Funcionários", icone: UserCog, cor: "verde" },
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
      <nav className="flex items-center justify-between px-55 py-3 bg-white border-y border-gray-200">
        <div className="flex items-center gap-3">
          <div className="justify-center w-10 h-10">
            <img className="rounded-xl" src="./LK.jpg" alt="Logo LKCell" />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-800 text-sm leading-tight">LKCell</span>
            <span className="text-gray-500 text-xs font-medium">Negócios</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-8">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-[#f4f6f8] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            />
          </div>
        </div>

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
              <img className="rounded-full" src="./User.jpg" alt="Icone Usuário" />
            </div>
            <span className="text-sm font-medium text-gray-700">Administrador</span>
          </button>
        </div>
      </nav>

      <main className="p-8 px-55 min-h-screen bg-[#f8f9fa]">
        <h1 className="text-2xl">Bem-vindo ao LkCell</h1>
        <br/>
        <p className="font-light">Acesse o módulo que deseja gerenciar</p>
        <br/>
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
              <div key={index} className={`relative bg-white rounded-xl p-6 flex flex-col gap-4 overflow-hidden border border-gray-100 cursor-pointer shadow-xl ${sombraGlow} transition-all duration-300 hover:-translate-y-1`}>
                <div className={`absolute top-0 left-0 w-full h-1 ${corBordaTopo}`}></div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${corFundoIcone}`}>
                  <card.icone className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="mt-2">
                  <h3 className="text-gray-800 font-semibold text-base">{card.titulo}</h3>
                  <p className="text-gray-400 text-sm mt-1">Gerenciar</p>
                </div>
              </div>
            );
          })}

        </div>
      </main>
    </>
  );
}
