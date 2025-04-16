// Importa o Express
const express = require('express');
const app = express();
const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;

// Middleware para logar todas as requisições
app.use((req, res, next) => {
    console.log(`Método: ${req.method}, URL: ${req.url}`);
    next();
});

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Rota GET na URL "/"
app.get('/', (req, res) => {
    res.send('<html><body><h1>Hello World</h1></body></html>');
});

// Rota GET na URL "/Teste"
app.get('/Teste', (req, res) => {
    res.send('<html><body><h1>Teste de route</h1></body></html>');
});/

// Rota GET na URL "/users" para obter todos os usuários
app.get('/users', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
            console.error('Erro ao ler o arquivo:', err);
            return res.status(500).json({ message: 'Erro ao obter os dados' });
        }

        try {
            const users = JSON.parse(fileData); // Converte o conteúdo do arquivo para JSON
            res.json(users); // Retorna todos os usuários
        } catch (parseErr) {
            console.error('Erro ao parsear o arquivo JSON:', parseErr);
            res.status(500).json({ message: 'Erro ao processar os dados' });
        }
    });
});

// Rota GET na URL "/users/:id" para obter um usuário específico pelo ID
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10); // Converte o ID para número

    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
            console.error('Erro ao ler o arquivo:', err);
            return res.status(500).json({ message: 'Erro ao obter os dados' });
        }

        try {
            const users = JSON.parse(fileData); // Converte o conteúdo do arquivo para JSON
            const user = users.find((u) => u.id === userId); // Busca o usuário pelo ID

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado' });
            }

            res.json(user); // Retorna o usuário encontrado
        } catch (parseErr) {
            console.error('Erro ao parsear o arquivo JSON:', parseErr);
            res.status(500).json({ message: 'Erro ao processar os dados' });
        }
    });
});

const fs = require('fs'); // Importa o módulo fs para manipular arquivos
const filePath = './data.json'; // Caminho do arquivo na pasta EX1

// Função para gerar um novo ID incremental
const generateId = (users) => {
    if (users.length === 0) return 1; // Se o array estiver vazio, o primeiro ID será 1
    const lastUser = users[users.length - 1];
    return lastUser.id + 1; // Incrementa o ID com base no último usuário
};

// Rota POST na URL "/data" para adicionar um novo usuário
app.post('/data', (req, res) => {
    const { nome, idade } = req.body;

    if (!nome || !idade) {
        return res.status(400).json({ message: 'Os campos nome e idade são obrigatórios.' });
    }

    // Lê o conteúdo atual do arquivo (se existir)
    fs.readFile(filePath, 'utf8', (err, fileData) => {
        let users = [];

        if (!err && fileData) {
            try {
                users = JSON.parse(fileData); // Converte o conteúdo do arquivo para JSON
                if (!Array.isArray(users)) users = []; // Garante que seja um array
            } catch (parseErr) {
                console.error('Erro ao parsear o arquivo JSON:', parseErr);
            }
        }

        // Cria o novo usuário com ID incremental
        const newUser = {
            id: generateId(users),
            nome,
            idade,
            timestamp: new Date().toISOString(), // Adiciona um timestamp
            status: 'processed', // Adiciona um status
        };

        // Adiciona o novo usuário ao array
        users.push(newUser);

        // Salva o array atualizado no arquivo
        fs.writeFile(filePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Erro ao salvar o arquivo:', writeErr);
                return res.status(500).json({ message: 'Erro ao salvar os dados' });
            }

            console.log('Dados salvos em data.json');
            // Retorna o JSON do novo usuário
            res.json({
                message: 'Usuário adicionado com sucesso!',
                user: newUser,
            });
        });
    });
});

// Rota para tratar erros 404
app.use((req, res) => {
    res.status(404).send('<html><body><h1>404 - Página não encontrada</h1></body></html>');
});

// Criação do servidor e escuta de requisições
app.listen(port, hostname, (error) => {
    if (error) {
        console.error('Erro ao iniciar o servidor:', error);
    } else {
        console.log(`App ouvindo em http://${hostname}:${port}/`);
    }
});