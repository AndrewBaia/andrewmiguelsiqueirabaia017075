## Dados do Candidato

# SEPLAG 2026 - Sistema de Gerenciamento de Artistas e Álbuns

Este projeto foi desenvolvido como parte do Processo Seletivo Simplificado (PSS) da SEPLAG-2026, focado no cargo de Desenvolvedor Full Stack Sênior pelo candidato ANDREW MIGUEL SIQUEIRA BAÍA. A aplicação consiste em um sistema completo para gestão de artistas e sua discografia, integrando tecnologias modernas de backend e frontend com foco em arquitetura limpa, segurança e escalabilidade.

- **Nome:** Andrew Miguel Siqueira Baia
- **Cargo:** Desenvolvedor Full Stack Sênior - Engenheiro de Computação
- **Incrição:** 16513

---

## Arquitetura e Decisões Técnicas

O projeto foi estruturado utilizando os princípios de **Arquitetura Hexagonal (Ports & Adapters)** e **Clean Architecture**, atendendo rigorosamente ao critério de **Organização Modular** exigido pelo edital. Esta escolha garante que as regras de negócio (Domínio) sejam independentes de frameworks, bancos de dados ou interfaces externas.

### Justificativa da Estrutura Modular

Diante dos critérios de avaliação (Arquitetura e Integração), a aplicação foi organizada da seguinte forma:

1. **Organização Modular e Integração**: Separação clara entre `backend` e `frontend`, orquestrados via `docker-compose` para garantir uma integração fluida e isolada.
2. **Comunicação entre Camadas**: Implementação de APIs RESTful consumidas pelo frontend com autenticação JWT funcional ponta a ponta.
3. **Backend Robusto**:
   * **CRUD, JWT e MinIO**: Implementação funcional com segurança e upload de arquivos.
   * **Paginação e Filtros**: Consultas otimizadas, ordenadas e paginadas.
   * **Rate Limit e Sincronização**: Controle rigoroso de requisições (Bucket4j) e lógica de sincronização de dados externos (Regionais).
   * **Swagger, Migrations e Health Check**: Documentação interativa, versionamento de banco com Flyway e verificação de integridade via Actuator.
   * **WebSocket e Notificações**: Atualização em tempo real no frontend para uma experiência dinâmica e reativa.

---

## Como Executar a Aplicação

Certifique-se de ter o **Docker** e o **Docker Compose** instalados.

### 1. Clonar o repositório e cole no CMD do Windows ou na sua IDE de preferência

```bash
git clone https://github.com/AndrewBaia/andrewmiguelsiqueirabaia017075.git
```

### 2. Entrar na pasta do projeto

```bash
cd andrewmiguelsiqueirabaia017075
```

### 3. Preparar o Ambiente (Limpeza do Docker)

Para garantir que não existam conflitos de portas ou volumes de execuções anteriores, recomenda-se realizar uma limpeza no ambiente Docker antes de subir a aplicação: Limpa todos os containers, redes e volumes não utilizados (Ambiente Limpo)

```bash
docker system prune -a --volumes -f
```

### 4. Subir os containers

Execute o comando abaixo na raiz do projeto para compilar e iniciar todos os serviços:

```bash
docker compose up --build -d
```

### 5. Acessar a aplicação

- **Frontend:** [http://localhost:3001](http://localhost:3001) (Login: `admin` / Senha: `admin321`)
- **API Documentation (Swagger):** [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html)
- **MinIO Console:** [http://localhost:9001](http://localhost:9001) (Login: `minioadmin` / `minioadmin`)

---

## Qualidade e Testes

### Backend (JUnit 5 + Mockito)

A validação foca na **lógica de negócio e integridade dos dados** na camada de serviço (`ArtistaService`), protegendo o sistema contra regressões.

- **Cenários**: CRUD completo, Paginação/Ordenação, Geração de Links S3, Sincronia WebSocket e Tratamento de Erros.
- **Execução**: `cd backend; mvn test`

### Frontend (Vitest + React Testing Library)

Cobertura abrangente de **22 testes unitários** que garantem a qualidade da interface e a robustez da gestão de estado.

- **Cenários**: Lógica de Cache, Atualização via WebSocket, Busca com Debounce, Fluxo de Login e Modais de Segurança.
- **Execução**: `cd frontend; npm test`

---

## Estrutura do Sistema

### Árvore de Diretórios

```text
FullStack/
├── backend/                    # API Spring Boot 3.2 (Java 21)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/seplag/artistalbum/
│   │   │   │   ├── application/    # Controllers e DTOs
│   │   │   │   ├── domain/         # Entidades, Services e Ports
│   │   │   │   └── infrastructure/ # Configurações, Segurança e Adapters
│   │   │   └── resources/
│   │   │       ├── db/migration/   # Scripts Flyway (V1 a V4)
│   │   │       └── application.yml # Configurações da API
│   │   └── test/                   # Testes Unitários (JUnit 5)
│   └── pom.xml                     # Dependências Maven
├── frontend/                   # React 18 + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/             # Componentes Reutilizáveis
│   │   ├── context/                # Gerenciamento de Estado (Auth, RateLimit, Notificações)
│   │   ├── pages/                  # Páginas Principais (Listagem, Detalhes, Formulários)
│   │   ├── services/               # API (Axios), Facade Pattern e WebSocket
│   │   ├── test/                   # Testes Unitários (Vitest)
│   │   └── types/                  # Definições de Tipos TypeScript
│   └── package.json                # Scripts e Dependências NPM
├── docker/                     # Dockerfiles e Nginx Config
└── docker-compose.yml          # Orquestração de Containers
```

### Acesso Rápido e Credenciais

| Serviço                | URL                                                                                             | Credenciais                     |
| :---------------------- | :---------------------------------------------------------------------------------------------- | :------------------------------ |
| **Frontend**      | [http://localhost:3001](http://localhost:3001)                                                     | `admin` / `admin321`        |
| **Swagger UI**    | [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html) | Token JWT Requerido             |
| **MinIO Console** | [http://localhost:9001](http://localhost:9001)                                                     | `minioadmin` / `minioadmin` |
| **Health Check**  | [http://localhost:8080/api/actuator/health](http://localhost:8080/api/actuator/health)             | -                               |

---

## Comentários do Desenvolvedor (Desafios Sênior)

O desenvolvimento deste projeto focou em resolver três desafios principais comuns em aplicações de alta escala:

1. **Sincronia de Estado**: O uso do **Facade Pattern** com **RxJS** permitiu um cache no frontend, enquanto o **WebSocket** garante que esse cache seja invalidado ou atualizado instantaneamente via Swagger ou outro usuário.
2. **Resiliência no Rate Limit**: Implementei um sistema que mantém a contagem regressiva persistente mesmo após o `F5`, garantindo que as regras de negócio sejam respeitadas com uma UX clara.
3. **Segurança de Ativos**: A integração com **MinIO** utiliza URLs pré-assinadas de 30 minutos, cumprindo o edital, mas mantendo a estabilidade via proxy reverso no backend.

---

## Endpoints da API

A documentação interativa completa pode ser acessada via **Swagger** em: [http://localhost:8080/api/swagger-ui/index.html](http://localhost:8080/api/swagger-ui/index.html)

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
- `DELETE /v1/artistas/{id}/foto`: Remover a foto de perfil do artista.
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

## Estrutura de Dados (Tabelas)

### artist

- `id` (BIGSERIAL PRIMARY KEY)
- `nome` (VARCHAR 255, UNIQUE)
- `url_imagem_perfil` (VARCHAR 255)
- `data_criacao`, `data_atualizacao` (TIMESTAMP)

### album

- `id` (BIGSERIAL PRIMARY KEY)
- `titulo` (VARCHAR 255)
- `artist_id` (BIGINT, FOREIGN KEY)
- `url_imagem_capa` (VARCHAR 500)
- `data_criacao`, `data_atualizacao` (TIMESTAMP)

### regional

- `id` (BIGSERIAL PRIMARY KEY)
- `nome` (VARCHAR 200)
- `ativo` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

---

## Notas Adicionais

O projeto foi desenvolvido focando em **Clean Code** e **Commits Semânticos**.

**Créditos:** Andrew Baía
