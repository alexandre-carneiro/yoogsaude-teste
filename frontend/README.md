## Frontend - Mini CRM de Atendimento

Aplicação React criada com **Create React App (TypeScript)**, utilizando **MUI** como biblioteca de componentes e **styled-components** para estilizações customizadas. A organização segue o padrão do **Atomic Design**.

### Stack

- React 18 + TypeScript
- Vite
- MUI (`@mui/material`, `@mui/icons-material`)
- styled-components

### Organização de pastas (Atomic Design)

- `src/components/atoms` – componentes mais básicos e reutilizáveis (botões, inputs, tipografia, etc.).
- `src/components/molecules` – composição simples de átomos (cards pequenos, campos compostos, etc.).
- `src/components/organisms` – blocos maiores de UI (formularios de paciente, listas de atendimentos, etc.).
- `src/components/templates` – estruturas de página/layout sem dados específicos.
- `src/pages` – páginas de rota (ex.: lista de atendimentos, cadastro de paciente).
- `src/layouts` – layouts de alto nível (ex.: layout principal com app bar/sidebar).
- `src/hooks` – hooks customizados (ex.: hooks para buscar pacientes/atendimentos).
- `src/services/api.ts` – client HTTP (`axios`) configurado para falar com o backend.
- `src/styles/theme` – temas do MUI (`muiTheme`) e tema global para styled-components (`globalTheme`).

### Execução via Docker Compose (recomendado)

O frontend foi pensado para rodar junto com o backend e o banco de dados via Docker Compose.

Na raiz do projeto:

```bash
docker compose up --build
```

Isso sobe:

- `db` – PostgreSQL.
- `backend` – API Node.js.
- `frontend` – aplicação React.

Após tudo subir, o frontend estará disponível em:

```text
http://localhost:3000
```

E ele se comunicará com o backend através da URL interna configurada no `docker-compose.yml`.

### Sobre rodar o frontend localmente

Embora tecnicamente seja possível rodar `npm run dev` dentro de `frontend/`, o fluxo oficial para avaliação deste teste é via Docker Compose. Dessa forma, garantimos que:

- O frontend sempre aponte para a URL correta do backend na rede Docker.
- Não haja dependência de configurações locais de ambiente (variáveis, portas em uso, etc.).

---

###

Inicialmente pensei no frontend com **Vite + React**. No entanto, a combinação das versões disponíveis no ambiente (Node, Vite, plugin React e React 18) estava gerando erros de bundle em runtime (por exemplo, mensagens como `Export 'import_react3' is not defined in module`), resultando em tela em branco mesmo com o código correto.

Para evitar gastar tempo de teste depurando incompatibilidades específicas de ferramenta e garantir um ambiente estável, o frontend foi migrado para **Create React App (CRA) com TypeScript**:

- CRA usa `react-scripts`, que possui uma integração estável com React 18.
- O fluxo de desenvolvimento fica mais simples (menos arquivos de configuração, menos moving parts).
- A integração com Docker é direta (`npm start` dentro do container).

Em um cenário de projeto real, Vite continuaria sendo uma ótima opção, mas para este desafio o foco foi priorizar **estabilidade e previsibilidade do ambiente** em detrimento de uma ferramenta de bundling mais moderna.



