-- Criação da base de dados
CREATE DATABASE IF NOT EXISTS PlataformaTurismo;
USE PlataformaTurismo;

-- Tabela Users conforme o teu modelo Sequelize (sem telefone)
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    role ENUM('admin', 'facilitador', 'estudante') DEFAULT 'estudante'
);

-- Utilizador com role 'admin'
INSERT INTO Users (username, email, password, zona, role) VALUES
('adminuser', 'admin@example.com', 'adminpass', 'Lisboa', 'admin');

-- Utilizador com role 'facilitador'
INSERT INTO Users (username, email, password, zona, role) VALUES
('facilitador1', 'facilitador@example.com', 'facipass', 'Porto', 'facilitador');

-- Utilizador com role 'estudante'
INSERT INTO Users (username, email, password, zona, role) VALUES
('estudante1', 'estudante@example.com', 'estupass', 'Faro', 'estudante');