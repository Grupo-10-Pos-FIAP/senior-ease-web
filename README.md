# SeniorEase

Plataforma web de acessibilidade digital para idosos — Hackathon FIAP (POSTECH — FRNT).

Facilita a vida acadêmica e profissional de pessoas idosas com fluxos guiados, personalização de acessibilidade e feedback claro em cada ação.

**Produção:** [https://senior-ease-web-nine.vercel.app](https://senior-ease-web-nine.vercel.app)

---

## Pré-requisitos

- **Node.js** 22+ (alinhado ao CI)
- **npm**
- Projeto **Firebase** (Auth + Firestore) com as variáveis de `.env.example`

---

## Passo a passo — executar o app

1. Clone o repositório e entre na pasta do projeto
2. Copie o ambiente e preencha as chaves do Firebase:

   ```bash
   cp .env.example .env.local
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse `http://localhost:5173` — login em `/entrar`; rotas autenticadas em `/`.

5. Comandos úteis:

   ```bash
   npm run build          # typecheck + build de produção
   npm run preview        # preview do build
   npm run lint           # ESLint
   npm run test           # Vitest (run once)
   npm run test:watch     # Vitest em modo watch
   npm run test:coverage
   npm run verify         # format + lint + test + build
   ```

---

## Stack

| Área          | Tecnologia                                          |
| ------------- | --------------------------------------------------- |
| Build         | Vite 8 + TypeScript 6 (`strict: true`)              |
| UI            | React 19, Radix UI (via `@shared/ui`), CSS + tokens |
| Roteamento    | React Router 7                                      |
| Server state  | TanStack Query 5                                    |
| Auth / dados  | Firebase Auth + Firestore (runtime)                 |
| Testes        | Vitest + Testing Library + MSW (API HTTP simulada)  |
| Lint / format | ESLint + Prettier                                   |

---

## Arquitetura

Clean Architecture com regra de dependência:

```
presentation → application → domain ← infrastructure
```

**Regras inegociáveis:**

- `domain/` — TypeScript puro; zero React, fetch ou MSW
- `application/` **nunca** importa `infrastructure/` — wiring só em `app/composition/`
- `presentation/` consome use cases via hooks; **não** acessa infrastructure
- Radix importado **apenas** em `shared/ui/` — pages e features usam `@shared/ui`
- React vive em `presentation/` + `app/`; wiring concreto só em `app/`

**Fluxo de wiring:**

```
Firebase / HttpClient → Repositories → UseCases → Hooks (presentation)
         ↑                  ↑             ↑
   infrastructure      composition    application
```

- **Runtime (dev/prod):** repositórios Firestore + Firebase Auth
- **Testes:** repositórios HTTP + MSW (`MODE === "test"`)

Detalhes por camada: pasta [`docs/`](docs/).

---

## Estrutura de pastas

```
src/
├── app/                          # Composition Root
│   ├── main.tsx                  # Entry (StrictMode)
│   ├── App.tsx                   # Shell raiz
│   ├── index.css                 # Reset + estilos base
│   ├── providers/                # Query, Auth, Accessibility
│   ├── router/                   # React Router
│   └── composition/              # Factories: repos + use cases
│
├── domain/                       # Núcleo — TypeScript puro
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/             # Ports (interfaces)
│   ├── constants/
│   └── errors/
│
├── application/                  # Casos de uso
│   ├── accessibility/
│   ├── tasks/
│   └── profile/
│
├── infrastructure/               # Adaptadores externos
│   ├── api/                      # HttpClient (testes)
│   ├── firebase/                 # client, auth, seed
│   ├── mappers/
│   ├── repositories/             # Firestore + HTTP + fallbacks
│   ├── seed/                     # catálogo de atividades
│   └── msw/                      # handlers/, db/, browser.ts, server.ts
│
├── presentation/                 # UI React
│   ├── pages/
│   ├── features/                 # personalization, tasks, profile
│   ├── hooks/
│   ├── layouts/
│   └── components/               # ProtectedRoute, etc.
│
└── shared/                       # Cross-cutting
    ├── ui/                       # tokens/, primitives/, components/
    ├── lib/
    ├── constants/
    └── test/                     # setup, renderWithProviders, fixtures
```

---

## Camadas — responsabilidades

| Camada         | Pasta             | Pode importar                                            | Não pode                        | Exemplos                                 |
| -------------- | ----------------- | -------------------------------------------------------- | ------------------------------- | ---------------------------------------- |
| Domain         | `domain/`         | — (núcleo)                                               | React, infrastructure           | `Task.ts`, `ITaskRepository.ts`          |
| Application    | `application/`    | `@domain`                                                | `@infrastructure`, React        | `CompleteTaskStep.ts`                    |
| Infrastructure | `infrastructure/` | `@domain`, `@shared`                                     | `@application`, `@presentation` | `FirestoreTaskRepository.ts`             |
| Presentation   | `presentation/`   | `@application`, `@domain`, `@shared`, `@app/composition` | `@infrastructure`, Radix direto | `DashboardPage.tsx`, hooks de feature    |
| App            | `app/`            | Todas (wiring)                                           | Regras de negócio               | `composition/useCases.ts`, `router/`     |
| Shared         | `shared/`         | `radix-ui` (só em `ui/`)                                 | Use cases, pages                | `ui/components/Button/`, `test/setup.ts` |

---

## Módulos de domínio

| Módulo            | Port(s)                                                                        | Entidades / VOs                                                                               | Use cases                                                                             |
| ----------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Accessibility** | `IPreferencesRepository`                                                       | `AccessibilityPreferences`, `FontSizeLevel`, `ContrastLevel`, `SpacingLevel`, `InterfaceMode` | Get / Update / Reset preferences                                                      |
| **Tasks**         | `ITaskRepository`, `IActivityCatalogRepository`, `IActivityProgressRepository` | `Task`, `Activity`, `ActivityProgress`, `Course`, steps / conteúdo                            | List, Get, Start, CompleteStep, CompleteGuideStep, UpdateCurrentStep, Complete, Reset |
| **Profile**       | `IUserRepository`                                                              | `User`, ciclo de vida da conta                                                                | Get / Update / Delete; Deactivate / Reactivate / GetAccountLifecycle                  |

**Rotas (presentation):**

| Rota                         | Página / feature                    |
| ---------------------------- | ----------------------------------- |
| `/entrar`                    | Login (guest)                       |
| `/`                          | Dashboard (lista de atividades)     |
| `/tarefas/:id`               | Entrada do fluxo da atividade       |
| `/tarefas/:id/guia`          | Guia / tutorial da atividade        |
| `/tarefas/:id/guia/:stepId`  | Tutorial de um passo                |
| `/tarefas/:id/passo/:stepId` | Execução do passo                   |
| `/tarefas/:id/concluida`     | Atividade concluída                 |
| `/perfil`                    | Perfil (tabs)                       |
| `/perfil/personalizacao`     | Preferências de acessibilidade      |
| `/perfil/conta`              | Dados da conta / ciclo de vida      |
| `/personalizacao`            | Redirect → `/perfil/personalizacao` |

Rotas autenticadas usam `ProtectedRoute`; `/entrar` usa `GuestRoute`.

---

## Persistência e API

### Runtime

- **Firebase Auth** — sessão do usuário
- **Firestore** — usuário, preferências, catálogo de atividades e progresso
- Sem `userId` fixo em produção: o UID vem da sessão autenticada

### Testes (MSW)

API HTTP simulada para os repositórios HTTP:

- `GET/PATCH /api/users/:id`
- `POST /api/users/:id/deactivate|reactivate`
- `DELETE /api/users/:id`
- `GET/PUT /api/users/:id/preferences`
- `GET /api/tasks`, `GET /api/tasks/:id`
- `PATCH /api/tasks/:id/start|complete|reset|current-step`
- `PATCH /api/tasks/:id/steps/:stepId`
- `PATCH /api/tasks/:id/guide/:stepId`

Conta: desativação com retenção de 90 dias + reativação no login/cadastro.

### Scripts Admin (Firebase)

Exigem service account do projeto Firebase correto (não commitar credenciais):

```bash
export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

npm run sync:course          # sincroniza catálogo de atividades
npm run reset:course         # reseta catálogo (wipe de activities)
npm run purge:accounts:dry   # simula purge de contas desativadas (>90 dias)
npm run purge:accounts       # executa purge (Auth + Firestore + activityProgress)
```

---

## Práticas do projeto

### Clean Architecture e SOLID

- **SRP** — 1 use case = 1 ação; componentes pequenos e focados
- **DIP** — use cases dependem de ports; HTTP/Firestore só em infrastructure
- **ISP** — ports enxutos por agregado
- **KISS** — Context + Query + factories manuais em `app/composition/`; sem Redux/Zustand

### TypeScript

- `strict: true`, props tipadas (`interface XxxProps`), unions discriminadas no domínio
- Aliases entre camadas (`@domain`, `@application`, etc.) — evite caminhos relativos profundos
- Sem `any`; event handlers com tipos nativos do DOM

### Estado

| Tipo                  | Onde                                        |
| --------------------- | ------------------------------------------- |
| Server state (API)    | TanStack Query — não duplicar em `useState` |
| Sessão                | `AuthProvider` (Context)                    |
| Prefs globais de a11y | `AccessibilityProvider` (Context)           |
| UI local              | `useState` / `useReducer` na feature        |

### UI e acessibilidade

- Radix Primitives **apenas** em `shared/ui/primitives/`; API pública via `@shared/ui`
- HTML semântico primeiro; ARIA só quando necessário
- Labels em PT-BR; touch targets mínimos 44px; respeitar `prefers-reduced-motion`
- Tokens CSS dinâmicos (fonte, contraste, spacing) via `AccessibilityProvider`

### Testes

- Co-localização: `*.test.ts(x)` ao lado do arquivo
- Domain/Application → Vitest unit; Infrastructure → Vitest + MSW; UI → Vitest + RTL
- Helpers reutilizáveis em `@shared/test`

### CI/CD

Pipeline em GitHub Actions (`.github/workflows/ci.yml`), disparado em `push` e `pull_request` na `main`:

1. **Qualidade (job `ci`)** — Node 22 → `npm ci` → format check → lint → testes → build
2. **Deploy (job `deploy`)** — só após o `ci` passar; preview em PRs e produção em push na `main` (Vercel CLI)

Localmente, o equivalente ao gate de qualidade é `npm run verify` (format + lint + test + build). Concurrency com `cancel-in-progress` evita jobs redundantes na mesma ref.

### Segurança

- **Secrets** — variáveis sensíveis só via GitHub Secrets (`VERCEL_*`) e `.env.local` (gitignored); `.env.example` traz placeholders sem credenciais
- **Credenciais Admin** — `service-account.json` e padrões `*-firebase-adminsdk-*` ignorados no git; scripts admin exigem service account local (não commitada)
- **Firestore Rules** — usuário autenticado acessa apenas os próprios dados (`users/{uid}`, `activityProgress`); catálogo (`courses` / `activities`) é read-only no client
- **Auth** — rotas protegidas com `ProtectedRoute` / `GuestRoute`; UID da sessão (sem `userId` fixo em produção)
- **Permissões mínimas no CI** — job de deploy com `contents: read`
- **Qualidade como barreira** — lint com `--max-warnings 0`, TypeScript `strict` e ESLint `jsx-a11y` no pipeline antes do deploy

---

## Onde colocar código novo

| O quê                                         | Onde                                         |
| --------------------------------------------- | -------------------------------------------- |
| Entidade, VO, port, erro de domínio           | `domain/`                                    |
| Caso de uso                                   | `application/{accessibility,tasks,profile}/` |
| HTTP, Firestore, mapper, repo, handler MSW    | `infrastructure/`                            |
| Page, feature, hook, layout                   | `presentation/`                              |
| Provider, router, factory/wiring              | `app/`                                       |
| Componente UI, wrapper Radix, helper de teste | `shared/`                                    |

---

## Aliases TypeScript

| Alias               | Caminho                |
| ------------------- | ---------------------- |
| `@domain/*`         | `src/domain/*`         |
| `@application/*`    | `src/application/*`    |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@presentation/*`   | `src/presentation/*`   |
| `@shared/*`         | `src/shared/*`         |
| `@app/*`            | `src/app/*`            |

Configurados em `tsconfig.app.json`, `vite.config.ts` e `vitest.config.ts`.
