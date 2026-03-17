## Backend - Mini CRM de Atendimento

Este documento descreve **decisões de arquitetura e desenvolvimento do backend**.

As instruções de como rodar o projeto (local e via Docker Compose) estão no `README.md` da raiz.

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

Detalhes adicionais sobre regras de negócio, validações e camadas serão adicionados conforme o backend evoluir.

