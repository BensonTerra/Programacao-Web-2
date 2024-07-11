const express = require('express');
const app = express();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 8080;

app.use(express.json()); // Habilita o parseamento de dados JSON no corpo da requisição

// Middleware para logar o status de cada requisição
app.use((req, res, next) => {
  const { method, url } = req; // Captura o método HTTP e o URL da requisição

  // Adiciona um ouvinte para o evento "finish" da resposta para obter o status
  res.on('finish', () => {
    const { statusCode } = res; // Obtém o status da resposta
    console.log(`${method} ${url} - ${statusCode}`); // Loga o método HTTP, URL e status da resposta
  });

  next(); // Continua o fluxo da requisição para o próximo middleware
});

// Rota raiz -- /api/
app.get('/', function (req, res) {
  res.status(200).json({ message: 'home -- vending machine api' });
});

// Middleware de roteamento para o recurso MOVIE
app.use('/teste1', require('./routes/teste1.routes.js'));

// Tratamento de rotas inválidas
app.all('*', function (req, res) {
  res.status(404).json({ message: 'WHAT???' });
});

// Inicia o servidor
app.listen(port, host, () => console.log(`App listening at http://${host}:${port}/`));
