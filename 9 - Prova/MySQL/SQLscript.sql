CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor'
);

CREATE TABLE Posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  views INT UNSIGNED DEFAULT 0,
  publishedAt DATETIME DEFAULT NOW(),
  author INT NOT NULL,
  FOREIGN KEY (author) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Tags (
  name VARCHAR(50) PRIMARY KEY
);

CREATE TABLE PostTags (
  PostId INT,
  TagName VARCHAR(50),
  PRIMARY KEY (PostId, TagName),
  FOREIGN KEY (PostId) REFERENCES Posts(id) ON DELETE CASCADE,
  FOREIGN KEY (TagName) REFERENCES Tags(name) ON DELETE CASCADE
);

INSERT INTO Users (username, password, role) VALUES
('bruno_admin', 'adminpass', 'admin'),
('carla_writer', 'passw0rd', 'editor'),
('ana_dev', '123456', 'editor');


INSERT INTO Posts (title, description, published, views, publishedAt, author) VALUES
('Introdução ao Node.js', 'Aprende os conceitos base de Node.js', true, 120, '2024-12-10', 1),
('Como criar uma API REST', 'Tutorial completo para iniciantes', false, 0, NULL, 3),
('Melhores práticas de segurança', 'Dicas para proteger as tuas apps web', true, 35, '2025-02-20', 1);


INSERT INTO Tags (name) VALUES
('node'),
('backend'),
('frontend'),
('api'),
('segurança'),
('tutorial');

-- Post 1: Introdução ao Node.js
INSERT INTO PostTags (PostId, TagName) VALUES (1, 'node'), (1, 'tutorial');

-- Post 2: Como criar uma API REST
INSERT INTO PostTags (PostId, TagName) VALUES (2, 'node'), (2, 'backend'), (2, 'api'), (2, 'tutorial');

-- Post 3: Melhores práticas de segurança
INSERT INTO PostTags (PostId, TagName) VALUES (3, 'backend'), (3, 'segurança');