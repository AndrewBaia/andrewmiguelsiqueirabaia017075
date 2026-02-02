-- Inserir artistas e álbuns iniciais
INSERT INTO artist (nome) VALUES
('Serj Tankian'),
('Mike Shinoda'),
('Michel Teló'),
('Guns N'' Roses');

-- Inserir álbuns para Serj Tankian
INSERT INTO album (titulo, artist_id) VALUES
('Harakiri', (SELECT id FROM artist WHERE nome = 'Serj Tankian')),
('Black Blooms', (SELECT id FROM artist WHERE nome = 'Serj Tankian')),
('The Rough Dog', (SELECT id FROM artist WHERE nome = 'Serj Tankian'));

-- Inserir álbuns para Mike Shinoda
INSERT INTO album (titulo, artist_id) VALUES
('The Rising Tied', (SELECT id FROM artist WHERE nome = 'Mike Shinoda')),
('Post Traumatic', (SELECT id FROM artist WHERE nome = 'Mike Shinoda')),
('Post Traumatic EP', (SELECT id FROM artist WHERE nome = 'Mike Shinoda')),
('Where''d You Go', (SELECT id FROM artist WHERE nome = 'Mike Shinoda'));

-- Inserir álbuns para Michel Teló
INSERT INTO album (titulo, artist_id) VALUES
('Bem Sertanejo', (SELECT id FROM artist WHERE nome = 'Michel Teló')),
('Bem Sertanejo - O Show (Ao Vivo)', (SELECT id FROM artist WHERE nome = 'Michel Teló')),
('Bem Sertanejo - (1ª Temporada) - EP', (SELECT id FROM artist WHERE nome = 'Michel Teló'));

-- Inserir álbuns para Guns N' Roses
INSERT INTO album (titulo, artist_id) VALUES
('Use Your Illusion I', (SELECT id FROM artist WHERE nome = 'Guns N'' Roses')),
('Use Your Illusion II', (SELECT id FROM artist WHERE nome = 'Guns N'' Roses')),
('Greatest Hits', (SELECT id FROM artist WHERE nome = 'Guns N'' Roses'));
