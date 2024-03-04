const clear = require('clear'); clear()
//console.log(process.argv)

let hoje = new Date(); console.log(hoje)
var diaAtual = hoje.getDate();
var mesAtual = hoje.getMonth() + 1;
var anoAtual = hoje.getFullYear();
console.log("Data atual: " + diaAtual + "/" + mesAtual + "/" + anoAtual);

const targetDates = 
[
  {
    nome:"Natal",
    data: 
    {
      dia: 25,
      mes: 12
    }
  }
]



