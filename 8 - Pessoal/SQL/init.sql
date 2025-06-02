UPDATE Users
SET role = 'admin'
WHERE email = 'admin@admin.com';

INSERT INTO Accommodations (
  title, description, location, room_type, bed_count, price_per_night,
  rating, start_date, end_date, available
) VALUES
('Casa do Campo', 'Alojamento rústico em ambiente natural, ideal para famílias.', 'Vila Real', 'Casa inteira', 5, 85.00, 4.5, '2025-07-01', '2025-08-31', TRUE),
('Suite Urbana Moderna', 'Apartamento T1 em zona central, perto de transportes.', 'Lisboa', 'Apartamento', 2, 110.00, 4.8, '2025-06-15', '2025-09-30', TRUE),
('Quarto Partilhado Hostel Surf', 'Hostel jovem perto da praia, ótimo para surfistas.', 'Ericeira', 'Quarto partilhado', 6, 25.00, 4.1, '2025-07-10', '2025-08-20', TRUE);INSERT INTO Events (nome, data_inicio, data_fim, localizacao, descricao, capacidade_max)
VALUES 
  ('Festival de Música Indie', '2025-08-10', '2025-08-12', 'Parque da Cidade, Porto', '3 dias de música alternativa ao ar livre.', 5000),
  ('Conferência Tech 2025', '2025-09-15', '2025-09-17', 'Centro de Congressos, Lisboa', 'Tecnologia, inovação e networking.', 1200),
  ('Workshop de Fotografia', '2025-07-05', '2025-07-06', 'Museu da Imagem, Braga', 'Aprenda técnicas práticas com profissionais.', 30);
  
  INSERT INTO Events (
  title, description, location, price, start_date, end_date, available
) VALUES
('Conferência Tech 2025', 'Evento anual sobre as últimas tendências em tecnologia.', 'Porto', 150.00, '2025-09-10', '2025-09-12', TRUE),
('Workshop de Fotografia', 'Curso prático para iniciantes em fotografia digital.', 'Lisboa', 75.00, '2025-07-05', '2025-07-07', TRUE),
('Festival de Música Jazz', 'Festival com artistas nacionais e internacionais.', 'Coimbra', 50.00, '2025-08-20', '2025-08-22', TRUE);

