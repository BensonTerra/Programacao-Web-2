const clear = require('clear'); clear()
//console.log(process.argv)
//const data = process.argv.slice(2)

const calc = (data) => 
{
  let res = 0
  if(data[0] == '+')
  {
    //console.log('data[0] = ' + '+')
    res = parseFloat(parseInt(data[1]) + parseInt(data[2]))
  }
  else if(data[0] == '-')
  {
    //console.log('data[0] = ' + '-')
    res = parseFloat(parseInt(data[1]) - parseInt(data[2]))
  }
  else if(data[0] == '*')
  {
    //console.log('data[0] = ' + '*')
    res = parseFloat(parseInt(data[1]) * parseInt(data[2]))
  }
  else if(data[0] == '/')
  {
    //console.log('data[0] = ' + '/')
    res = parseFloat(parseInt(data[1]) / parseInt(data[2]))
  }
  else
  {
    console.log("Insira dados corretamente");
  }
  console.log("Resposta = " + res)
}

module.exports = 
{
  calc
};