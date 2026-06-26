// Lógica da Tela de Catálogo
import { useState, useEffect } from "react";
import { Folder, Tag, Smartphone, Package } from "lucide-react";

export function useGerenciarCatalogo() {
  // Contagem de registros existentes em cada entidade — usada para
  // montar a mensagem de pré-requisito do tooltip de cada card.
  // null = ainda carregando, número = quantidade de registros.
  const [contagens, setContagens] = useState({
    categoria: null,
    marca: null,
    modelo: null,
  });
  const [loadingContagens, setLoadingContagens] = useState(true);

  useEffect(() => {
    const buscarContagens = async () => {
      try {
        // TODO: descomentar quando os endpoints existirem no backend.
        // Cada rota deve retornar um array; usamos o tamanho dele
        // como contagem (ajuste se o backend já expuser um total).

        const [resCategoria, resMarca, resModelo] = await Promise.all([
          fetch("http://localhost:3000/api/categorias"),
          fetch("http://localhost:3000/api/marcas"),
          fetch("http://localhost:3000/api/modelos"),
        ]);

        const categorias = resCategoria.ok ? await resCategoria.json() : [];
        const marcas = resMarca.ok ? await resMarca.json() : [];
        const modelos = resModelo.ok ? await resModelo.json() : [];

        setContagens({
          categoria: Array.isArray(categorias) ? categorias.length : 0,
          marca: Array.isArray(marcas) ? marcas.length : 0,
          modelo: Array.isArray(modelos) ? modelos.length : 0,
        });

        // Mock temporário enquanto os endpoints não existem.
        // Troque pelos fetches reais acima quando o backend estiver pronto.
        setContagens({ categoria: 0, marca: 0, modelo: 0 });
      } catch (err) {
        console.error("Erro ao verificar pré-requisitos do catálogo:", err);
        setContagens({ categoria: 0, marca: 0, modelo: 0 });
      } finally {
        setLoadingContagens(false);
      }
    };

    buscarContagens();
  }, []);

  // Monta o painel de cards já com a mensagem de tooltip calculada
  // a partir das contagens buscadas.
  const painel = [
    {
      titulo: "Categoria",
      icone: Folder,
      cor: "azul",
      link: "/catalogo/categoria/gerenciar/",
      numero: 1,
      tooltip: "Nenhum pré-requisito",
    },
    {
      titulo: "Marca",
      icone: Tag,
      cor: "azul",
      link: "/catalogo/marca/gerenciar",
      numero: 2,
      tooltip:
        contagens.categoria === null
          ? "Verificando pré-requisitos..."
          : contagens.categoria > 0
            ? "Pré-requisito atendido: Categoria cadastrada"
            : "Requer: cadastrar Categoria primeiro",
    },
    {
      titulo: "Modelo",
      icone: Smartphone,
      cor: "azul",
      link: "/catalogo/modelo/gerenciar",
      numero: 3,
      tooltip:
        contagens.marca === null
          ? "Verificando pré-requisitos..."
          : contagens.marca > 0
            ? "Pré-requisito atendido: Marca cadastrada"
            : "Requer: cadastrar Marca primeiro",
    },
    {
      titulo: "Produto",
      icone: Package,
      cor: "verde",
      link: "/catalogo/produto/gerenciar",
      numero: 4,
      tooltip:
        contagens.categoria === null ||
        contagens.marca === null ||
        contagens.modelo === null
          ? "Verificando pré-requisitos..."
          : contagens.categoria > 0 &&
              contagens.marca > 0 &&
              contagens.modelo > 0
            ? "Pré-requisitos atendidos: Categoria, Marca e Modelo cadastrados"
            : "Requer: Categoria, Marca e Modelo cadastrados",
    },
  ];

  return {
    painel,
    contagens,
    loadingContagens,
  };
}
