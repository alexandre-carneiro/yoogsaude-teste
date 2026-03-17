## Mini CRM de Atendimento

Backend em Node.js/TypeScript com PostgreSQL e Prisma, frontend em React, orquestrados com Docker Compose.

### Como rodar tudo com Docker Compose

Na raiz do projeto:

```bash
docker compose up --build
```

Isso sobe:

- Serviço `db` (PostgreSQL).
- Serviço `backend` (API em Node.js).
- Futuramente será adicionado o serviço do frontend.

Após tudo subir, o backend ficará acessível em:

```text
http://localhost:3333
```

Healthcheck:

```text
GET http://localhost:3333/api/health
```