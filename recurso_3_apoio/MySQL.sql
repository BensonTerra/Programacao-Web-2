-- Tabela de utilizadores
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher') NOT NULL
);

-- Tabela de projetos
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author INT NOT NULL,
  supervisor INT DEFAULT NULL,
  deadline DATE NOT NULL,
  maxAttempts INT DEFAULT 3,
  status ENUM('pending', 'approved', 'submitted', 'graded', 'expired') NOT NULL,
  grade FLOAT DEFAULT NULL,
  FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisor) REFERENCES users(id) ON DELETE SET NULL 
);

-- Tabela de submissões
CREATE TABLE submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project INT NOT NULL,
  submittedBy INT NOT NULL,
  submittedAt DATETIME NOT NULL default CURRENT_TIMESTAMP,
  FOREIGN KEY (project) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserção de dados
INSERT INTO users (id, email, name, password, role) VALUES
(1, 'ana.aluno@example.com', 'Ana Aluno', '1234', 'student'),
(2, 'bruno.prof@example.com', 'Bruno Professor', '1234', 'teacher'),
(3, 'carlos.prof@example.com', 'Carlos Professor', '1234', 'teacher'),
(4, 'daniel.aluno@example.com', 'Daniel Aluno', '1234', 'student');

INSERT INTO projects (id, title, author, supervisor, deadline, maxAttempts, status, grade) VALUES
-- Estado: pending
(1, 'Chatbot Académico', 4, 2, '2025-07-28', 3, 'pending', NULL),
(2, 'App de Tarefas', 1, 3, '2025-07-25', 2, 'pending', NULL),
(3, 'App de Clima', 1, 2, '2025-07-23', 3, 'pending', NULL),
-- Estado: approved
(4, 'Sistema de Reservas', 1, 2, '2025-07-23', 2, 'approved', NULL),
(5, 'Plataforma de Estágios', 4, 3, '2025-07-25', 3, 'approved', NULL),
(6, 'Gestor de Finanças', 1, 3, '2025-07-22', 2, 'approved', NULL),
-- Estado: submitted
(7, 'Jogo Web', 1, 2, '2025-07-01', 2, 'submitted', NULL),
(8, 'Quiz Interativo', 4, 2, '2025-07-15', 3, 'submitted', NULL),
(9, 'Sistema de Votação', 1, 2, '2025-07-23', 2, 'submitted', NULL),
-- Estado: graded
(10, 'Portal de Notícias', 1, 2, '2025-06-20', 3, 'graded', 18),
-- Estado: expired
(11, 'Plataforma Educativa', 4, 3, '2025-07-21', 3, 'expired', NULL);

INSERT INTO submissions (id, project, submittedBy, submittedAt) VALUES
-- Projeto 7: 'Jogo Web' (autor: utilizador 1)
(1, 7, 1, '2025-06-30 10:00:00'),
(2, 7, 1, '2025-07-01 08:00:00'),
-- Projeto 8: 'Quiz Interativo' (autor: utilizador 4)
(3, 8, 4, '2025-07-10 16:00:00'),
-- Projeto 9: 'Sistema de Votação' (autor: utilizador 1)
(4, 9, 1, '2025-07-12 11:00:00'),
-- Projeto 10: 'Portal de Notícias' (autor: utilizador 1)
(5, 10, 1, '2025-06-18 14:00:00'),
(6, 10, 1, '2025-06-19 22:00:00');

