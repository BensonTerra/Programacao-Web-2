// Array contendo as datas alvo
const targetDates = [
  {
    nome: "Natal",
    data: {
      dia: 25,
      mes: 12
    }
  },
  // Adicione mais datas alvo, se necessário
];

// Função para calcular a diferença em dias entre a data atual e as datas alvo
function calcularDiferencaEmDias() {
  // Data atual
  const dataAtual = new Date();
  
  // Diferença em dias para cada data alvo
  const diferencaEmDias = targetDates.map(targetDate => {
    // Cria um objeto Date para a data alvo usando o ano atual
    const dataAlvo = new Date(dataAtual.getFullYear(), targetDate.data.mes - 1, targetDate.data.dia);
    
    // Calcula a diferença em milissegundos
    const diferencaEmMilissegundos = Math.abs(dataAlvo - dataAtual);
    
    // Converte a diferença de milissegundos para dias
    const milissegundosPorDia = 1000 * 60 * 60 * 24;
    const diferencaEmDias = Math.floor(diferencaEmMilissegundos / milissegundosPorDia);
    
    return { nome: targetDate.nome, diferenca: diferencaEmDias };
  });
  
  return diferencaEmDias;
}

// Calcula a diferença em dias
const diferencaEmDias = calcularDiferencaEmDias();

// Exibe os resultados
console.log("Diferença em dias para as datas alvo:");
diferencaEmDias.forEach(resultado => {
  console.log(resultado.nome + ": " + resultado.diferenca + " dias");
});
