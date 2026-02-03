# SEPLAG 2026 - Sistema de Gerenciamento de Artistas e Álbuns

Este projeto foi desenvolvido como parte do Processo Seletivo Simplificado (PSS) da SEPLAG-2026, focado no cargo de Desenvolvedor Full Stack Sênior pelo candidato ANDREW MIGUEL SIQUEIRA BAÍA. A aplicação consiste em um sistema completo para gestão de artistas e sua discografia, integrando tecnologias modernas de backend e frontend com foco em arquitetura limpa, segurança e escalabilidade.

---

##  Dados do Candidato - Andrew Miguel Siqueira Baía
- **Vaga:** Engenheiro de Computação - Sênior
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

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/AndrewBaia/andrewmiguelsiqueirabaia017075.git
    cd SEPLAG-2026-PSS/FullStack
    ```

2.  **Subir os containers:**
    ```bash
    docker-compose up --build -d
    ```
    *Este comando iniciará o Banco de Dados, MinIO, API Backend e o Frontend.*

3.  **Acessar a aplicação:**
    - **Frontend:** [http://localhost:3001](http://localhost:3001)(Login: admin Senha: admin321)
    - **API Documentation (Swagger):** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
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

- [x] **Containers:** Orquestração completa via `docker-compose`.
- [x] **Segurança:** JWT (5 min), Renovação de Token, Rate Limit (10 req/min).
- [x] **Storage:** Integração MinIO com Presigned URLs (30 min).
- [x] **WebSocket:** Notificações em tempo real no frontend ao cadastrar álbuns.
- [x] **Sincronização:** Lógica de regionais da Polícia Civil com controle de "ativo" e versionamento.
- [x] **Frontend Sênior:** Facade Pattern + BehaviorSubject (RxJS).
- [x] **Qualidade:** Testes unitários e Health Checks (`/actuator/health`) - http://localhost:8080/api/actuator/health

---

## 🗄️ Estrutura de Dados (Tabelas)

### `artista`
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR 255, UNIQUE)
- `genero` (VARCHAR 100)

### `album`
- `id` (SERIAL PRIMARY KEY)
- `titulo` (VARCHAR 255)
- `data_lancamento` (DATE)
- `imagem_capa_key` (VARCHAR 500)
- `artista_id` (FOREIGN KEY)

### `regional`
- `id` (INTEGER PRIMARY KEY)
- `nome` (VARCHAR 200)
- `ativo` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

---

## Notas Adicionais
O projeto foi desenvolvido focando em **Clean Code** e **Commits Semânticos**.
Créditos: Andrew Baía

