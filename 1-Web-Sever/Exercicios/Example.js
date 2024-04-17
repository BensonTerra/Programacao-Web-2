// Array contendo as datas alvo
const targetDates = [
  {
    nome: "Natal",
    data: {
      dia: 25,
      mes: 12
    }
  },
  {
    nome: "Ano Novo",
    data: {
      dia: 1,
      mes: 1
    }
  },
  {
    nome: "Dia dos Namorados",
    data: {
      dia: 12,
      mes: 6
    }
  },
  {
    nome: "Dia da Independência",
    data: {
      dia: 7,
      mes: 9
    }
  },
  {
    nome: "Dia das Crianças",
    data: {
      dia: 12,
      mes: 10
    }
  },
  {
    nome: "Dia dos Finados",
    data: {
      dia: 2,
      mes: 11
    }
  },
  {
    nome: "Dia da Proclamação da República",
    data: {
      dia: 15,
      mes: 11
    }
  },
  {
    nome: "Dia do Trabalho",
    data: {
      dia: 1,
      mes: 5
    }
  },
  {
    nome: "Dia do Orgulho LGBTQ+",
    data: {
      dia: 28,
      mes: 6
    }
  },
  {
    nome: "Dia Internacional da Mulher",
    data: {
      dia: 8,
      mes: 3
    }
  }
];

// Função para calcular a diferença em dias entre a data atual e as datas alvo
function calcularDiferencaEmDias() {
  // Data atual
  const dataAtual = new Date();
  
  // Diferença em dias até a próxima ocorrência de cada data alvo
  const diferencaEmDias = targetDates.map(targetDate => {
    // Cria um objeto Date para a próxima ocorrência da data alvo
    const proximaOcorrencia = new Date(dataAtual.getFullYear(), targetDate.data.mes - 1, targetDate.data.dia);
    
    // Se a próxima ocorrência já passou este ano, ajusta para o próximo ano
    if (proximaOcorrencia < dataAtual) {
      console.log(dataAtual + '\n' + proximaOcorrencia)
      proximaOcorrencia.setFullYear(dataAtual.getFullYear() + 1);
      console.log(proximaOcorrencia)
    }
    
    // Calcula a diferença em milissegundos
    const diferencaEmMilissegundos = proximaOcorrencia.getTime() - dataAtual.getTime();
    
    // Converte a diferença de milissegundos para dias
    const milissegundosPorDia = 1000 * 60 * 60 * 24;
    const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / milissegundosPorDia);
    
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
