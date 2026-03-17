## Backend - Mini CRM de Atendimento

Este documento descreve **decisões de arquitetura e desenvolvimento do backend**.

As instruções de como rodar o projeto estão no [README da raiz](../README.md).

### Tecnologias principais

- Node.js + TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Jest + Supertest (testes de integração)

### Organização de pastas (backend)

- `src/config` – configurações de infraestrutura (ex.: cliente Prisma).
- `src/controllers` – controladores HTTP, responsáveis por orquestrar requests/responses.
- `src/routes` – definição das rotas e ligação com controllers.
- `src/middleware` – middlewares de cross-cutting concerns (ex.: tratamento de erros).
- `src/lib` – utilitários e helpers genéricos.
- `prisma/` – schema Prisma e migrações de banco.

---

### Endpoints expostos

Todos os endpoints do backend estão sob o prefixo `/api`.

#### Healthcheck

- **GET** `/api/health`  
  - Retorna `{ "status": "ok" }`.  
  - Utilizado para verificação simples de disponibilidade.

#### Patients (`/api/patients`)

- **POST** `/api/patients`  
  - Cria um paciente.  
  - Body (exemplo):
    ```json
    {
      "name": "John Doe",
      "phone": "+55 11 99999-0000",
      "email": "john@example.com",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "notes": "Optional notes"
    }
    ```
  - Validação via Zod (campos obrigatórios, formato de e‑mail, data etc.).

- **GET** `/api/patients`  
  - Lista todos os pacientes (ordenados por `createdAt desc`).

- **GET** `/api/patients/:id`  
  - Retorna os dados de um paciente específico.
  - `404` se não existir.

- **PUT** `/api/patients/:id`  
  - Atualiza dados do paciente (mesmo conjunto de campos da criação).  
  - `404` se não existir.

- **DELETE** `/api/patients/:id`  
  - Remove o paciente **apenas se não houver atendimentos vinculados**.  
  - Respostas:
    - `400` – se houver atendimentos:  
      ```json
      { "message": "Não é possível excluir o paciente com atendimentos existentes" }
      ```
    - `404` – paciente inexistente.
    - `200` – paciente removido:
      ```json
      { "message": "Paciente excluído com sucesso" }
      ```

#### Appointments (`/api/appointments`)

- **POST** `/api/appointments`  
  - Cria um atendimento vinculado a um paciente.  
  - Body (exemplo):
    ```json
    {
      "patientId": "uuid-do-paciente",
      "title": "Initial consultation",
      "description": "Short description",
      "scheduledFor": "2026-03-20T10:00:00.000Z",
      "priority": 1
    }
    ```
  - Regras:
    - `patientId` deve existir (caso contrário, `404 Patient not found`).
    - `status` **sempre** é criado como `AGUARDANDO`, ignorando qualquer valor enviado.

- **GET** `/api/appointments`  
  - Lista atendimentos **paginados** com filtros opcionais.  
  - Query params:
    - `patientId` – filtra por paciente.
    - `status` – filtra por status (`AGUARDANDO`, `EM_ATENDIMENTO`, `FINALIZADO`).
    - `page` – número da página (padrão `1`).
    - `pageSize` – quantidade de registros por página (padrão `10`).  
  - Resposta (página atual + metadados de paginação):
    ```json
    {
      "items": [ /* atendimentos da página atual */ ],
      "total": 1,
      "page": 1,
      "pageSize": 10
    }
    ```

- **GET** `/api/appointments/:id`  
  - Detalhe de um atendimento, incluindo alguns dados básicos do paciente.
  - `404` se não existir.

- **PUT** `/api/appointments/:id`  
  - Atualiza dados do atendimento (título, descrição, `scheduledFor`, `priority`), mas **não altera o status**.
  - `404` se não existir.

- **DELETE** `/api/appointments/:id`  
  - Exclui o atendimento.  
  - Respostas:
    - `404` – se não existir.
    - `200` – se excluído:
      ```json
      { "message": "Atendimento excluído com sucesso" }
      ```

- **PATCH** `/api/appointments/:id/status`  
  - Atualiza o status do atendimento.  
  - Body:
    ```json
    { "status": "EM_ATENDIMENTO" }
    ```
  - Regras de transição implementadas:
    - `AGUARDANDO → EM_ATENDIMENTO`
    - `EM_ATENDIMENTO → FINALIZADO`
    - Não é permitido:
      - voltar (`EM_ATENDIMENTO → AGUARDANDO`, etc.),
      - pular (`AGUARDANDO → FINALIZADO`).
  - Side effects:
    - Ao mudar para `EM_ATENDIMENTO`, preenche `startedAt` se ainda não estiver definido.
    - Ao mudar para `FINALIZADO`, preenche `finishedAt` se ainda não estiver definido.
  - Transições inválidas retornam `400` com mensagem:
    ```json
    { "message": "Transição de status inválida de AGUARDANDO para FINALIZADO" }
    ```

---

### Decisões de arquitetura

- **Separação em camadas simples**
  - `routes` concentra a definição de rotas e URL base.
  - `controllers` concentram a orquestração HTTP (recebem `req/res`, chamam Prisma, validam entrada).
  - Não foi criada uma camada explícita de `services`/`use-cases` para manter o escopo do teste enxuto; a lógica de negócio (como as transições de status) está concentrada nos controllers de `appointments`.

- **Prisma como ORM e migrações**
  - Optado por Prisma pela boa integração com TypeScript, migrações versionadas e enum de status tipado.
  - O modelo usa:
    - `Paciente` (patient) com campos básicos de contato + metadados (`createdAt`, `updatedAt`).
    - `Atendimento` (appointment) com enum `AtendimentoStatus` e datas auxiliares (`scheduledFor`, `startedAt`, `finishedAt`).
  - Tradeoff: o backend fica acoplado ao schema do Prisma, mas ganha em segurança de tipos e produtividade.

- **Validação com Zod**
  - Entradas principais (`patients` e `appointments`) são validadas com Zod nos controllers.
  - Decisão: manter a validação no backend mesmo que o frontend também valide, para garantir integridade.

- **Tratamento de erros**
  - Middleware `errorHandler` central simples, responsável por logar e retornar `500` em erros não tratados.
  - Erros de domínio e validação retornam códigos específicos (`400`, `404`) diretamente nos controllers.

- **O que foi deliberadamente deixado de fora**
  - **Autenticação/autorização**: não fazem parte do escopo do desafio e adicionariam complexidade (tokens, escopos), mas num ambiente real eles seriam fundamentais.
  - **Camada de serviços desacoplada**: para o tamanho da API, os controllers concentrando a lógica são suficientes; em um sistema maior, faria sentido extrair services/use-cases testáveis isoladamente.
  - **Logs estruturados e observabilidade**: mantido apenas `console.error` no `errorHandler` para simplicidade; em produção seria interessante usar um logger estruturado.
  - **Paginação avançada**: foi implementada paginação simples com `page`/`pageSize` em atendimentos, sem metadados mais ricos (links de próxima página, etc.) para manter o foco no domínio.

---

### Estratégia de testes

- **Testes de integração (Jest + Supertest)**
  - `tests/health.test.ts` – valida o endpoint de healthcheck.
  - `tests/patients.test.ts` – cobre o fluxo completo de CRUD de pacientes.
  - `tests/appointments.test.ts`:
    - Criação de atendimento com status inicial `AGUARDANDO`.
    - Tentativa de transição inválida de status (erro esperado).
    - Fluxo completo de transição até `FINALIZADO`, verificando `startedAt` e `finishedAt`.

- **Execução dos testes no Docker**
  - Como o banco de dados está provisionado via Docker Compose, a forma recomendada de rodar os testes é **dentro do container do backend**, garantindo que a `DATABASE_URL` aponte para o serviço `db`.
  - Script disponível em `package.json`:
    ```bash
    npm run test-docker
    ```
    que executa:
    ```bash
    docker compose exec backend npm test
    ```

- **Por que rodar testes localmente não está funcional**
  - Ao rodar `npm test` diretamente no host, o Prisma usa a `DATABASE_URL` do `.env` (com host `localhost`).
  - Em ambientes onde existe outro Postgres em `localhost:5432` (ou nenhuma instância com as credenciais esperadas), o Prisma não consegue autenticar e os testes falham com `PrismaClientInitializationError`.
  - No Docker Compose, o backend usa um valor diferente de `DATABASE_URL` (host `db`, usuário/senha conhecidos), garantindo um ambiente controlado.
  - Para evitar acoplamento à configuração de banco local da máquina de quem está avaliando, os testes foram pensados para rodar via Docker (`npm run test-docker`), usando exclusivamente o banco do `docker-compose.yml`.


