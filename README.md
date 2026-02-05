# SEPLAG 2026 - Sistema de Gerenciamento de Artistas e Álbuns

Este projeto foi desenvolvido como parte do Processo Seletivo Simplificado (PSS) da SEPLAG-2026, focado no cargo de Desenvolvedor Full Stack Sênior pelo candidato ANDREW MIGUEL SIQUEIRA BAÍA. A aplicação consiste em um sistema completo para gestão de artistas e sua discografia, integrando tecnologias modernas de backend e frontend com foco em arquitetura limpa, segurança e escalabilidade.

---

## Dados do Candidato - Andrew Miguel Siqueira Baía

- **Vaga:** Engenheiro de Computação - Sênior
- **Incrição:** 16513
- **Tecnologias Foco:** Java (Spring Boot) & React (TypeScript)

---

## Arquitetura e Decisões Técnicas

O projeto foi estruturado utilizando os princípios de **Arquitetura Hexagonal (Ports & Adapters)** e **Clean Architecture**, garantindo que as regras de negócio (Domínio) sejam independentes de frameworks, bancos de dados ou interfaces externas.

### Backend (Java 21 + Spring Boot 3.2)

- **Arquitetura:** Divisão em camadas claras: `Application` (Controllers), `Domain` (Services/Ports), `Infrastructure` (Adapters/Config).
- **Segurança:**
  - Autenticação JWT com expiração de 5 minutos.
  - CORS configurado para restringir acessos não autorizados.
  - **Rate Limiting:** Implementado via Bucket4j (máximo 10 requisições/min por usuário).
- **Persistência & Migrações:** PostgreSQL com **Flyway** para versionamento de banco de dados.
- **Storage:** Integração com **MinIO (S3 API)** para armazenamento de capas de álbuns, utilizando **Presigned URLs** com validade de 30 minutos para acesso seguro.
- **Comunicação em Tempo Real:** **WebSocket (STOMP)** para notificações de novos álbuns cadastrados.
- **Sincronização de Regionais:** Implementação de lógica de sincronização com a API externa da Polícia Civil, garantindo menor complexidade algorítmica e histórico de alterações.

### Frontend (React 18 + TypeScript)

- **Estado e Padrões:** Implementação do **Facade Pattern** e gerenciamento de estado reativo com **BehaviorSubject (RxJS)**, garantindo fluxo de dados unidirecional e previsível.
- **UI/UX:** Interface inspirada no Spotify (Dark Mode), totalmente responsiva com **Tailwind CSS**.
- **Segurança Proativa:** Modal de aviso de expiração de sessão ("Ainda está aí?") que aparece 30 segundos antes do token expirar, permitindo a renovação sem perda de dados.
- **Performance:** Uso de **Lazy Loading** para rotas e componentes.

---

## Tecnologias Utilizadas

- **Backend:** Java 21, Spring Boot 3.2, Spring Security, JWT, Spring Data JPA, Flyway, Bucket4j, WebSocket, OpenAPI/Swagger.
- **Frontend:** React, TypeScript, Tailwind CSS, RxJS, Lucide React, React Hook Form, Zod.
- **Infraestrutura:** Docker, Docker Compose, PostgreSQL, MinIO.

---

## Como Executar a Aplicação

Certifique-se de ter o **Docker** e o **Docker Compose** instalados.

1. **Clonar o repositório:**

   ```bash
   git clone https://github.com/AndrewBaia/andrewmiguelsiqueirabaia017075.git
   cd andrewmiguelsiqueirabaia017075
   ```
2. **Subir os containers:**

   ```bash
   docker-compose up --build -d
   ```

   *Este comando iniciará o Banco de Dados, MinIO, API Backend e o Frontend.*
3. **Acessar a aplicação:**

   - **Frontend:** [http://localhost:3001](http://localhost:3001)(Login: admin Senha: admin321)
   - **API Documentation (Swagger):** [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html)
   - **MinIO Console:** [http://localhost:9001](http://localhost:9001) (Login: `minioadmin` / `minioadmin`)

---

## 🧪 Como Executar os Testes

### Backend

A validação dos testes de backend pode ser feita de duas formas:

- **Via Docker (Recomendado):** Os testes unitários são executados automaticamente durante o processo de build das imagens ao rodar `docker-compose up --build`.
- **Via IDE (IntelliJ/Eclipse):** Abra o projeto `backend`, navegue até a pasta `/src/test/java/com.seplag.artistalbum/ArtistServiceTest.java`, clique com o botão direito e selecione **'Run 'ArtistServiceTest.java''**.

### Frontend

Para rodar os testes do frontend localmente:

```bash
cd frontend
npm install
npm test
```

---

## 📋 Requisitos Implementados (Sênior)

- [X] **Containers:** Orquestração completa via `docker-compose`.
- [X] **Segurança:** JWT (5 min), Renovação de Token, Rate Limit (10 req/min).
- [X] **Storage:** Integração MinIO com Presigned URLs (30 min).
- [X] **WebSocket:** Notificações em tempo real no frontend ao cadastrar álbuns.
- [X] **Sincronização:** Lógica de regionais da Polícia Civil com controle de "ativo" e versionamento.
- [X] **Frontend Sênior:** Facade Pattern + BehaviorSubject (RxJS).
- [X] **Qualidade:** Testes unitários e Health Checks (`/actuator/health`) - http://localhost:8080/api/actuator/health

---

## 🚀 Endpoints da API

A documentação interativa completa pode ser acessada via Swagger em: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### Regionais

APIs de gerenciamento das regionais da polícia.

- `POST /v1/regionais/sincronizar`: Disparar sincronização manual das regionais.
- `GET /v1/regionais`: Obter todas as regionais ativas.

### Autenticação

APIs de gerenciamento de autenticação.

- `POST /auth/login`: Autenticar usuário e obter token JWT.
- `POST /auth/refresh`: Renovar token JWT.

### Artistas

APIs de gerenciamento de artistas.

- `GET /v1/artistas`: Listar todos os artistas com paginação e ordenação.
- `GET /v1/artistas/{id}`: Obter artista por ID com álbuns.
- `POST /v1/artistas`: Criar um novo artista.
- `PUT /v1/artistas/{id}`: Atualizar um artista existente.
- `DELETE /v1/artistas/{id}`: Excluir um artista.
- `GET /v1/artistas/pesquisa`: Pesquisar artistas por nome.
- `POST /v1/artistas/{id}/foto`: Fazer upload da foto de perfil do artista.
- `GET /v1/artistas/foto/{idArtista}`: Obter foto de perfil do artista.

### Álbuns

APIs de gerenciamento de álbuns.

- `POST /v1/albuns`: Criar um novo álbum.
- `GET /v1/albuns/{id}`: Obter álbum por ID.
- `PUT /v1/albuns/{id}`: Atualizar um álbum existente.
- `DELETE /v1/albuns/{id}`: Excluir um álbum.
- `GET /v1/albuns/artista/{idArtista}`: Obter álbuns por artista com paginação.
- `GET /v1/albuns/artista/{idArtista}/todos`: Obter todos os álbuns por artista sem paginação.
- `POST /v1/albuns/{id}/capa`: Fazer upload da imagem de capa do álbum.
- `GET /v1/albuns/capa/{idAlbum}`: Obter imagem de capa do álbum.

### API Raiz

- `GET /`: Informações básicas da API.

---

## 🗄️ Estrutura de Dados (Tabelas)

### `artist`

- `id` (BIGSERIAL PRIMARY KEY)
- `nome` (VARCHAR 255, UNIQUE)
- `url_imagem_perfil` (VARCHAR 255) - *Adicionado na migração V4*
- `data_criacao`, `data_atualizacao` (TIMESTAMP)

### `album`

- `id` (BIGSERIAL PRIMARY KEY)
- `titulo` (VARCHAR 255)
- `artist_id` (BIGINT, FOREIGN KEY)
- `url_imagem_capa` (VARCHAR 500)
- `data_criacao`, `data_atualizacao` (TIMESTAMP)

### `regional`

- `id` (BIGSERIAL PRIMARY KEY)
- `nome` (VARCHAR 200)
- `ativo` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

---

## Notas Adicionais

O projeto foi desenvolvido focando em **Clean Code** e **Commits Semânticos**.
Créditos: Andrew Baía
