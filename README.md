# CMMS Cervejaria — Sistema de Gestão da Manutenção

Sistema profissional de PCM/CMMS desenvolvido para substituir o controle de Ordens de Serviço em planilha, com arquitetura escalável (React + TypeScript no frontend, Node.js + Express + Prisma + PostgreSQL no backend).

> **Status do projeto**: em construção incremental. Veja "Progresso" abaixo para saber o que já está pronto.

## Stack

| Camada      | Tecnologia |
|-------------|------------|
| Frontend    | React, TypeScript, Tailwind CSS, Shadcn/UI, React Query, React Router, Framer Motion, ECharts |
| Backend     | Node.js, Express, Prisma ORM |
| Banco       | PostgreSQL |
| Auth        | JWT (access + refresh token) |
| Infra       | Docker, Docker Compose |

## Como rodar localmente (modo desenvolvimento)

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose
- npm

### 1. Subir o PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

A API sobe em `http://localhost:3333/api`. Endpoint de saúde: `GET /api/health`.

**Usuários de teste (senha padrão para todos: `Cmms@123`)**

| Perfil       | E-mail                              |
|--------------|--------------------------------------|
| Administrador| admin@cervejaria.com                 |
| PCM          | pcm@cervejaria.com                   |
| Supervisor   | supervisor@cervejaria.com            |
| Mecânico     | mecanico1@cervejaria.com             |
| Eletricista  | eletricista1@cervejaria.com          |
| Solicitante  | solicitante.envase@cervejaria.com    |

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Como rodar em produção (Docker Compose completo)

```bash
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed   # opcional, apenas na primeira subida
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3333/api`

## Arquitetura do backend

```
backend/
  prisma/
    schema.prisma       # modelo completo de dados
    seed/index.ts        # massa inicial de dados
  src/
    config/              # env, prisma client, logger
    middlewares/          # authenticate, authorize (RBAC), errorHandler
    modules/
      auth/               # controller, service, dto, jwt
      work-orders/        # CRUD, status, comentários, checklist, peças, horas, anexos
      assets/             # CRUD, hierarquia, leituras de medidor
      preventive/         # CRUD + geração automática de OS
      purchases/          # CRUD, fluxo de status, entrada em estoque
      inventory/          # CRUD de peças, movimentações
      suppliers/          # CRUD
      employees/          # (próxima fase)
      dashboard/          # (próxima fase)
      reports/            # (próxima fase)
      notifications/      # (próxima fase)
    jobs/
      scheduledJobs.ts     # cron: preventivas vencidas, OS atrasada, estoque baixo
    routes/index.ts       # agregador de rotas da API
    shared/errors/         # AppError e derivadas
    app.ts                 # bootstrap do Express
    server.ts               # entrypoint
```

Cada módulo segue o padrão: `*.routes.ts → *.controller.ts → *.service.ts → prisma`, com DTOs validados via Zod. Isso mantém regra de negócio isolada de Express e do ORM.

## Principais endpoints da API

Todos sob o prefixo `/api`, exigem header `Authorization: Bearer <accessToken>` exceto `auth/login` e `auth/refresh`.

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login (retorna access + refresh token) |
| POST | `/auth/refresh` | Renova o access token |
| GET  | `/auth/me` | Dados do usuário autenticado |
| GET  | `/auth/permissions` | Matriz de permissões do perfil logado |
| GET/POST | `/work-orders` | Listar (com filtros/paginação) e criar OS |
| GET/PUT/DELETE | `/work-orders/:id` | Detalhe, atualizar, excluir OS |
| PATCH | `/work-orders/:id/status` | Mudar status (com histórico automático) |
| POST | `/work-orders/:id/comments` \| `/checklist` \| `/parts` \| `/labor` \| `/attachments` | Sub-recursos da OS |
| GET/POST | `/assets` | Listar e criar ativos |
| GET/POST | `/preventive-plans` | Planos preventivos |
| POST | `/preventive-plans/:id/generate-now` | Gera a OS do plano manualmente |
| GET/POST | `/purchase-orders` | Pedidos de compra |
| PATCH | `/purchase-orders/:id/status` | Avança o status (dá entrada em estoque ao receber) |
| GET/POST | `/parts` | Peças de estoque |
| POST | `/parts/:id/movements` | Registrar entrada/saída/ajuste manual |
| GET/POST | `/suppliers` | Fornecedores |
| GET/POST | `/users` | Funcionários (ADMIN) |
| GET | `/dashboard/summary` | Todos os cards, gráficos e indicadores |
| GET | `/notifications` | Notificações do usuário logado |
| GET/POST | `/sectors` | Setores |

## Perfis de acesso (RBAC)

| Perfil        | Acesso |
|---------------|--------|
| ADMIN         | Total, incluindo configurações e funcionários |
| PCM           | Gestão completa de OS, ativos, preventivas, compras, estoque, relatórios |
| SUPERVISOR    | Visualiza e acompanha todas as OS do seu setor, aprova, gera relatórios |
| MECANICO/ELETRICISTA | Vê e executa apenas as OS atribuídas a si |
| SOLICITANTE   | Abre OS e acompanha o status das que solicitou |

A matriz de permissões vive em `backend/src/middlewares/authorize.ts` (`PERMISSION_MATRIX`) e será exposta ao frontend via `GET /api/auth/me` + endpoint de permissões.

## Progresso do desenvolvimento

- [x] Planejamento de arquitetura
- [x] Estrutura de pastas (monorepo)
- [x] Schema Prisma completo (todas as entidades)
- [x] Docker Compose + Dockerfiles
- [x] Seed do banco com dados reais de uma cervejaria
- [x] Fundação do backend: config, logger, erros, autenticação JWT + RBAC
- [x] API REST: Ordens de Serviço (CRUD, status, comentários, checklist, peças, horas, anexos)
- [x] API REST: Ativos (CRUD, hierarquia, leituras de medidor)
- [x] API REST: Preventivas (CRUD + geração automática de OS via cron diário)
- [x] API REST: Compras (CRUD, fluxo de status, entrada automática em estoque ao receber)
- [x] API REST: Estoque (CRUD, movimentações, alerta de estoque mínimo)
- [x] API REST: Fornecedores (CRUD)
- [x] Jobs agendados: geração de preventivas, OS atrasada, estoque baixo
- [x] API REST: Funcionários/Usuários (CRUD, troca de senha, soft delete)
- [x] API REST: Dashboard (cards, gráficos e indicadores MTTR/MTBF/Disponibilidade/SLA/Backlog)
- [x] API REST: Notificações (listar, marcar como lida)
- [x] API REST: Setores (CRUD, base para formulários)
- [x] Endpoint `/auth/permissions` expondo a matriz de RBAC ao frontend
- [ ] Relatórios (exportação PDF/Excel/CSV) — feito junto com o frontend na próxima fase
- [x] Frontend: Dashboard executivo completo (10 cards, 4 gauges, 9 gráficos ECharts, timeline)
- [x] Frontend: Ordens de Serviço — tabela com filtros/paginação, Nova OS, Detalhes completos (comentários, checklist, peças, horas, anexos, histórico, mudança de status validada)
- [x] Frontend: Ativos (grid, filtros, novo ativo, detalhe com ficha técnica/histórico de OS/leituras de medidor)
- [x] Frontend: Preventivas (cards com destaque de atrasadas/da semana, novo plano, geração manual de OS)
- [x] Frontend: Compras (quadro Kanban por status, novo pedido com itens dinâmicos, avanço de status)
- [x] Frontend: Estoque (tabela com alerta de estoque mínimo, nova peça, movimentações)
- [x] Frontend: Fornecedores (cadastro e listagem)
- [x] Frontend: Funcionários (CRUD, perfis de acesso, desativação)
- [x] Frontend: Indicadores (KPIs completos: Backlog, Lead Time, MTTR, MTBF, Disponibilidade, Eficiência, SLA, Custo por OS/Máquina/Setor)
- [x] Frontend: Relatórios (exportação CSV, Excel e PDF de 6 relatórios diferentes)
- [x] Frontend: Configurações (perfil, tema, troca de senha)
- [x] Backend: endpoint adicional `/dashboard/cost-by-asset` para o relatório de custo por máquina

## Escopo do briefing original — status

Todas as 10 telas do menu lateral estão implementadas e conectadas à API real. O sistema está funcionalmente completo conforme o escopo original; os itens abaixo são recomendados como próximos passos de hardening antes de produção:

- [ ] Rodar `npm install` + `npm run build` em ambos os projetos localmente e corrigir eventuais erros de tipagem (não foi possível validar neste ambiente por falta de acesso à internet)
- [ ] Testes automatizados (unitários no backend, E2E no frontend)
- [ ] CI/CD (GitHub Actions ou similar) rodando lint + build + testes a cada PR
- [ ] Página de edição de Ativos, Fornecedores e Peças (atualmente só criação; edição pode reusar os mesmos dialogs com `defaultValues`)
- [ ] Substituir a exportação de PDF (baseada em `window.print()`) por geração real de PDF no backend caso o layout precise ser mais elaborado
- [ ] Testes de carga no endpoint `/dashboard/summary`, que hoje roda várias queries agregadas em paralelo
- [ ] Frontend: design system, layout base, autenticação
- [ ] Frontend: Dashboard executivo com gráficos
- [ ] Frontend: telas de OS, Ativos, Preventivas, Compras, Estoque
- [ ] Frontend: Indicadores e Relatórios (exportação PDF/Excel/CSV)
- [ ] Jobs agendados (preventivas vencidas, SLA, estoque baixo)

## Licença

Uso interno da cervejaria — proprietário.
