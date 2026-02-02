-- Criação da tabela artist
CREATE TABLE artist (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela album
CREATE TABLE album (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    artist_id BIGINT NOT NULL,
    url_imagem_capa VARCHAR(500),
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artist(id) ON DELETE CASCADE
);

-- Criação da tabela regional para integração com departamento policial
CREATE TABLE regional (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nome, ativo)
);

-- Criação de índices para melhor desempenho
CREATE INDEX idx_artist_nome ON artist(nome);
CREATE INDEX idx_album_artist_id ON album(artist_id);
CREATE INDEX idx_album_titulo ON album(titulo);
CREATE INDEX idx_regional_nome ON regional(nome);
CREATE INDEX idx_regional_ativo ON regional(ativo);

-- Função trigger para atualizar o campo data_atualizacao
CREATE OR REPLACE FUNCTION atualizar_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criação de triggers para atualizar o campo data_atualizacao
CREATE TRIGGER atualizar_artist_data_atualizacao BEFORE UPDATE ON artist
    FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_album_data_atualizacao BEFORE UPDATE ON album
    FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_regional_data_atualizacao BEFORE UPDATE ON regional
    FOR EACH ROW EXECUTE FUNCTION atualizar_data_atualizacao();
