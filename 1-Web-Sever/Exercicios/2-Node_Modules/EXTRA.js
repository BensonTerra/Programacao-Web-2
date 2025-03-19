const clear = require('clear'); clear()
//console.log(process.argv)

let hoje = new Date(); console.log(hoje)
var diaAtual = hoje.getDate();
var mesAtual = hoje.getMonth() + 1;
var anoAtual = hoje.getFullYear();
console.log("Data atual: " + diaAtual + "/" + mesAtual + "/" + anoAtual);

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

const calculoDiferenca = () =>
{
  hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  let diferencaDias = targetDates.map( date => 
  {
    //console.log(date)
    let targetDate = new Date(hoje.getFullYear(), date.data.mes - 1, date.data.dia)
    targetDate.setHours(0, 0, 0, 0)

    if(targetDate < hoje)
    {
      targetDate.setFullYear(hoje.getFullYear() + 1)
    }

    let diferencaMs = Math.abs(targetDate - hoje)

    let milissegundosPorDia = 1000 * 60 * 60 * 24
    let diferencaDias = Math.floor(diferencaMs / milissegundosPorDia)

    return { nome: date.nome, diferenca: diferencaDias + " dias" };
  })
  return diferencaDias
}
//console.table(calculoDiferenca())


module.exports = 
{
  calculoDiferenca
}