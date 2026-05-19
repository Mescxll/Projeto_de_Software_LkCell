// /src/utils/formatarNome
const formatarNome = (nome) => {
  return nome
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((palavra) => {
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
};

module.exports = formatarNome;