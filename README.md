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

---

### Testes automatizados do backend

Os testes de integração (Jest + Supertest) rodam **dentro do container** do backend, usando o banco provisionado pelo Docker Compose.

- Na raiz do projeto:

```bash
npm run test-docker
```

Esse script executa:

```bash
docker compose exec backend npm test
```

> Observação: rodar `npm test` diretamente no host não é suportado neste momento, pois o Prisma tentará se conectar a `localhost` com credenciais que podem não existir na máquina de quem está rodando. Usar o banco do Docker garante um ambiente consistente.

---

### Estrutura do projeto

- `backend/` – API em Node.js/TypeScript (Express + Prisma + Jest).
- `frontend/` – será implementado posteriormente (React).

---

- Detalhes de endpoints, regras de negócio e decisões de arquitetura do backend estão documentados em [backend/README.md](./backend/README.md).
- Detalhes de endpoints, regras de negócio e decisões de arquitetura do frontend estão documentados em [frontend/README.md](./frontend/README.md).