// app/catalogo/produto/visualizar/[id]/page.jsx
"use client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useVisualizarProduto } from "@/hooks/catalogo/produto/useVisualizarProduto";
import {
  ArrowLeft,
  Pencil,
  Package,
  Tag,
  Folder,
  Smartphone,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Boxes,
  ShieldCheck,
  MapPin,
} from "lucide-react";

export default function VisualizarProduto() {
  const router = useRouter();
  const { id } = useParams();

  const {
    loading,
    produto,
    erro,
    estoqueAtual,
    estoqueMinimoAtual,
    estoqueIdealAtual,
    estoquePorLocalizacao,
    inclusoes,
    exclusoes,
    formatarPreco,
    formatarMargem,
  } = useVisualizarProduto(id);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando produto...</p>
        </main>
      </>
    );
  }

  if (erro || !produto) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Produto não encontrado
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                O produto que você está procurando não existe.
              </p>
              <button
                onClick={() => router.push("/catalogo/produto/gerenciar")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                Voltar para Produtos
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Status do estoque
  const semEstoque = estoqueAtual === 0 || estoqueAtual === null;
  const estoqueAbaixoMinimo =
    estoqueMinimoAtual !== null && estoqueAtual !== null && estoqueAtual < estoqueMinimoAtual;

  const estoqueStatusColor = semEstoque
    ? { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" }
    : estoqueAbaixoMinimo
      ? { bg: "#fefce8", text: "#a16207", border: "#fde047" }
      : { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };

  const estoqueStatusLabel = semEstoque
    ? "Sem estoque"
    : estoqueAbaixoMinimo
      ? "Abaixo do mínimo"
      : "Em estoque";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        {/* Voltar */}
        <button
          onClick={() => router.push("/catalogo/produto/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Produtos
        </button>

        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">

          {/* ── Cabeçalho ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/80 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {produto.descricao || produto.descricao}
                  </h1>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {produto.nome}
                  </p>
                  <span className="inline-block mt-1.5 text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {produto.codigo_produto}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Badge estoque */}
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full border text-[11px] font-semibold"
                  style={{
                    backgroundColor: estoqueStatusColor.bg,
                    color: estoqueStatusColor.text,
                    borderColor: estoqueStatusColor.border,
                  }}
                >
                  {estoqueStatusLabel}
                </span>

                <Link
                  href={`/catalogo/produto/atualizar/${produto.id_produto}`}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm ml-2"
                >
                  <Pencil className="w-4 h-4" /> Atualizar
                </Link>
              </div>
            </div>

            {/* Classificação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Categoria
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800">
                    {produto.categoria?.nome ?? "—"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Marca
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Tag className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800">
                    {produto.modelo?.marca?.nome ?? "—"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Modelo
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Smartphone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-gray-800">
                    {produto.modelo?.nome ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Preços ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-800">Preços</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Preço de Compra
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatarPreco(produto.preco_compra)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Preço de Custo
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatarPreco(produto.preco_custo)}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs font-semibold text-green-700 mb-1">
                  Preço de Venda
                </p>
                <p className="text-lg font-bold text-green-700">
                  {formatarPreco(produto.preco_venda)}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-700">
                    Margem de Lucro
                  </p>
                </div>
                <p className="text-lg font-bold text-blue-700">
                  {formatarMargem(produto.margem_lucro)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Estoque ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-6">
              <Boxes className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-800">Estoque</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Estoque Atual
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: estoqueStatusColor.text }}
                >
                  {estoqueAtual ?? "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">unidades (total)</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Estoque Mínimo
                </p>
                <p className="text-3xl font-bold text-gray-700">
                  {estoqueMinimoAtual ?? "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">unidades</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Estoque Ideal
                </p>
                <p className="text-3xl font-bold text-gray-700">
                  {estoqueIdealAtual ?? "—"}
                </p>
                <p className="text-xs text-gray-400 mt-1">unidades</p>
              </div>
            </div>

            {estoqueAbaixoMinimo && !semEstoque && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  Estoque abaixo do mínimo recomendado. Considere realizar uma compra.
                </p>
              </div>
            )}

            {semEstoque && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  Produto sem estoque disponível.
                </p>
              </div>
            )}

            {/* Estoque por localização */}
            {estoquePorLocalizacao.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Quantidade por localização
                </p>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr className="text-xs font-semibold text-gray-500">
                        <th className="px-4 py-3">Localização</th>
                        <th className="px-4 py-3 text-right">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {estoquePorLocalizacao.map((loc) => {
                        const locAbaixoMinimo =
                          estoqueMinimoAtual !== null &&
                          loc.estoque_atual < estoqueMinimoAtual;

                        return (
                          <tr
                            key={loc.id_localizacao ?? "sem-localizacao"}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                <MapPin className="w-3 h-3" />
                                {loc.localizacao}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`text-sm font-bold ${
                                  locAbaixoMinimo ? "text-yellow-700" : "text-gray-800"
                                }`}
                              >
                                {loc.estoque_atual}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">
                                unid.
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Compatibilidades ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800">
                  Compatibilidades
                </h2>
              </div>
            </div>

            {/* Modo de compatibilidade */}
            <div className="mb-6">
              {produto.compativel_todas_marcas ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-xs font-semibold text-green-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Compatível com todas as marcas
                  {exclusoes.length > 0 && (
                    <span className="text-green-600 font-normal">
                      — exceto {exclusoes.length} listada(s) abaixo
                    </span>
                  )}
                </div>
              ) : inclusoes.length > 0 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Compatível com marcas/modelos específicos
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-500">
                  Nenhuma compatibilidade cadastrada
                </div>
              )}
            </div>

            {/* Tabela de EXCLUSÕES (quando compativel_todas_marcas = true) */}
            {produto.compativel_todas_marcas && exclusoes.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-red-600 mb-3 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Exceções — não compatível com:
                </p>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr className="text-xs font-semibold text-gray-500">
                        <th className="px-4 py-3">Marca</th>
                        <th className="px-4 py-3">Modelo</th>
                        <th className="px-4 py-3">Observação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {exclusoes.map((c) => (
                        <tr key={c.id_compatibilidade} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                              <Tag className="w-3 h-3" />
                              {c.marca?.nome ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                              <Smartphone className="w-3 h-3" />
                              {c.modelo?.nome ?? "(todos os modelos)"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {c.observacao || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tabela de INCLUSÕES (quando compativel_todas_marcas = false) */}
            {!produto.compativel_todas_marcas && inclusoes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-600 mb-3 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Compatível com:
                </p>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr className="text-xs font-semibold text-gray-500">
                        <th className="px-4 py-3">Marca</th>
                        <th className="px-4 py-3">Modelo</th>
                        <th className="px-4 py-3">Observação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {inclusoes.map((c) => (
                        <tr key={c.id_compatibilidade} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                              <Tag className="w-3 h-3" />
                              {c.marca?.nome ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                              <Smartphone className="w-3 h-3" />
                              {c.modelo?.nome ?? "(todos os modelos)"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {c.observacao || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}