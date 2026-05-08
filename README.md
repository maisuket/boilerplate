# Fullstack Boilerplate

> Boilerplate profissional e escalável para aplicações SaaS modernas, construído com **Next.js 14** + **NestJS** + **TypeScript**.

[![CI](https://github.com/your-org/boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/boilerplate/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Stack

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 14 | Framework React com App Router |
| TypeScript | 5 | Tipagem estática |
| TailwindCSS | 3 | Estilização utilitária |
| Shadcn/UI | latest | Componentes de UI |
| TanStack Query | 5 | Cache e estado assíncrono |
| React Hook Form | 7 | Formulários |
| Zod | 3 | Validação de schemas |
| Axios | 1 | HTTP client com interceptors |
| Recharts | 2 | Gráficos |
| Sonner | 1 | Notificações/Toasts |
| Lucide React | latest | Ícones |
| next-themes | latest | Dark/Light mode |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| NestJS | 10 | Framework Node.js |
| TypeScript | 5 | Tipagem estática |
| Prisma | 5 | ORM |
| PostgreSQL | 16 | Banco de dados |
| JWT | - | Autenticação |
| bcrypt | - | Hash de senhas |
| Swagger | - | Documentação da API |
| Helmet | - | Segurança HTTP |
| Winston | - | Logs |
| Handlebars | - | Templates de email |
| Jest | - | Testes |

### Infraestrutura
| Tecnologia | Uso |
|---|---|
| Docker | Containerização |
| Docker Compose | Orquestração local |
| Nginx | Reverse proxy (produção) |
| Redis | Cache e sessões |
| MailHog | Email (desenvolvimento) |
| GitHub Actions | CI/CD |

---

## Requisitos

- **Node.js** >= 20.x
- **npm** >= 10.x
- **Docker** >= 24.x
- **Docker Compose** >= 2.x

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/your-org/boilerplate.git
cd boilerplate
```

### 2. Configure as variáveis de ambiente

```bash
# Raiz do projeto
cp .env.example .env

# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edite os arquivos `.env` com suas configurações.

### 3. Inicie com Docker (recomendado)

```bash
# Inicia todos os serviços (banco, redis, mailhog, backend, frontend)
docker compose up -d

# Verifica os logs
docker compose logs -f
```

### 4. Ou instale manualmente

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

---

## URLs de Acesso

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Swagger Docs | http://localhost:3001/api/docs |
| MailHog UI | http://localhost:8025 |
| Health Check | http://localhost:3001/api/health |

---

## Scripts

### Backend

```bash
cd backend

npm run start:dev      # Desenvolvimento com hot-reload
npm run start:debug    # Debug com hot-reload
npm run build          # Build de produção
npm run start:prod     # Inicia build de produção

npm run test           # Testes unitários
npm run test:watch     # Testes em modo watch
npm run test:cov       # Testes com coverage
npm run test:e2e       # Testes end-to-end

npm run lint           # ESLint
npm run format         # Prettier

npx prisma studio      # Interface visual do banco
npx prisma migrate dev # Cria nova migration
npx prisma db seed     # Executa seed
```

### Frontend

```bash
cd frontend

npm run dev            # Desenvolvimento
npm run build          # Build de produção
npm run start          # Inicia build de produção
npm run lint           # ESLint
npm run type-check     # TypeScript check
npm run format         # Prettier
```

---

## Estrutura do Projeto

```
boilerplate/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI pipeline
│   │   └── deploy.yml          # Deploy pipeline
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Schema do banco
│   │   ├── seed.ts             # Seed inicial
│   │   └── migrations/         # Migrations
│   ├── src/
│   │   ├── config/             # Configurações tipadas
│   │   ├── modules/
│   │   │   ├── auth/           # Autenticação JWT
│   │   │   ├── users/          # CRUD de usuários
│   │   │   └── health/         # Healthcheck
│   │   ├── prisma/             # Prisma Service global
│   │   ├── shared/
│   │   │   ├── decorators/     # Decorators customizados
│   │   │   ├── dto/            # DTOs compartilhados
│   │   │   ├── filters/        # Exception filters
│   │   │   ├── guards/         # Guards de autenticação
│   │   │   ├── interceptors/   # Interceptors globais
│   │   │   ├── interfaces/     # Interfaces TypeScript
│   │   │   └── utils/          # Utilitários
│   │   ├── mail/               # Sistema de email
│   │   └── main.ts             # Entry point
│   ├── test/                   # Testes e2e
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         # Rotas de autenticação
│   │   │   ├── (dashboard)/    # Rotas do dashboard
│   │   │   └── layout.tsx      # Layout raiz
│   │   ├── components/
│   │   │   ├── ui/             # Componentes Shadcn
│   │   │   ├── forms/          # Formulários
│   │   │   ├── charts/         # Gráficos Recharts
│   │   │   ├── layout/         # Sidebar, Header
│   │   │   ├── dashboard/      # Cards, tabelas do dashboard
│   │   │   └── feedback/       # Loading, Empty, Error states
│   │   ├── constants/          # Rotas, query keys, config
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Axios, utils, auth helpers
│   │   ├── providers/          # Context providers
│   │   ├── schemas/            # Zod schemas
│   │   ├── services/           # Chamadas à API
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Formatters, helpers
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf              # Configuração Nginx
├── docker-compose.yml          # Stack de desenvolvimento
├── docker-compose.prod.yml     # Stack de produção
└── .env.example
```

---

## Autenticação

O sistema utiliza **JWT com Refresh Tokens**:

1. Login retorna `accessToken` (15min) e `refreshToken` (7d)
2. O `accessToken` é enviado no header `Authorization: Bearer <token>`
3. O frontend detecta erros 401 e automaticamente renova o token via `refreshToken`
4. O `refreshToken` é armazenado em cookie httpOnly (produção) ou localStorage (desenvolvimento)

### Usuários de Seed

| Email | Senha | Role |
|---|---|---|
| admin@boilerplate.com | Admin@123! | ADMIN |
| user@boilerplate.com | User@123! | USER |

---

## API Endpoints

### Auth
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Registrar novo usuário |
| POST | `/api/auth/login` | Fazer login |
| POST | `/api/auth/refresh` | Renovar tokens |
| POST | `/api/auth/logout` | Fazer logout |
| GET | `/api/auth/me` | Perfil do usuário autenticado |

### Users
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/users` | Listar usuários (admin) |
| GET | `/api/users/:id` | Buscar usuário por ID |
| PATCH | `/api/users/:id` | Atualizar usuário |
| DELETE | `/api/users/:id` | Deletar usuário (admin) |

### Health
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/health` | Status dos serviços |

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

```env
# App
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/boilerplate

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Mail
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USER=
MAIL_PASS=
MAIL_FROM=noreply@boilerplate.com
```

### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Boilerplate
```

---

## Deploy em Produção

### Pré-requisitos
- Servidor com Docker e Docker Compose
- Domínio configurado com DNS
- Certificado SSL (recomendado: Let's Encrypt)

### Passos

```bash
# 1. Clone no servidor
git clone https://github.com/your-org/boilerplate.git
cd boilerplate

# 2. Configure as variáveis de produção
cp backend/.env.example backend/.env.production
cp frontend/.env.example frontend/.env.production
# Edite os arquivos com valores de produção!

# 3. Configure secrets no GitHub
# DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY

# 4. Inicie a stack
docker compose -f docker-compose.prod.yml up -d

# 5. Execute migrations
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# 6. Execute seed (apenas primeira vez)
docker compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

### SSL com Let's Encrypt

```bash
# Instale certbot
sudo apt install certbot

# Gere o certificado
sudo certbot certonly --standalone -d seu-dominio.com

# Copie para o diretório nginx
cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem nginx/ssl/
```

---

## Boas Práticas Implementadas

### Segurança
- [x] Helmet para headers HTTP seguros
- [x] Rate limiting por IP
- [x] Validação rigorosa de inputs com class-validator e Zod
- [x] Hash de senhas com bcrypt (salt rounds: 12)
- [x] JWT com expiração curta + refresh token
- [x] CORS configurado
- [x] Sanitização de dados sensíveis nos logs

### Performance
- [x] TanStack Query para cache de dados no frontend
- [x] Paginação em todas as listagens
- [x] Índices otimizados no Prisma schema
- [x] Compressão gzip no backend
- [x] Skeleton loaders para melhor UX

### Código
- [x] TypeScript strict mode em ambos os projetos
- [x] ESLint + Prettier configurados
- [x] Husky + lint-staged (pre-commit hooks)
- [x] Separação clara de responsabilidades
- [x] DTOs para todas as entradas/saídas da API
- [x] Interfaces tipadas compartilhadas
- [x] Tratamento global de erros

### Observabilidade
- [x] Winston para logs estruturados
- [x] Interceptor de logging de requisições
- [x] Middleware de auditoria
- [x] Healthcheck com status detalhado
- [x] Swagger completo

---

## Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

### Padrão de Commits (Conventional Commits)

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de build/config
```

---

## Licença

MIT © [Your Organization]
