# SeniorEase

Plataforma web de acessibilidade digital para idosos — Hackathon FIAP.

Repositório em **fase scaffold**: estrutura Clean Architecture, toolchain e contratos definidos. Código de negócio e UI serão implementados nas fases futuras.

---

## Pré-requisitos

- **Node.js** 22+ (alinhado ao CI)
- **npm**

---

## Passo a passo — executar o app

1. Clone o repositório e entre na pasta do projeto
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse `http://localhost:5173` — você verá o placeholder "SeniorEase — em construção".

4. Comandos opcionais:

   ```bash
   npm run build        # typecheck + build de produção
   npm run preview      # preview do build
   npm run lint         # ESLint
   npm run test         # Vitest (run once)
   npm run test:watch   # Vitest em modo watch
   npm run test:coverage
   ```

---

## Stack

| Área         | Tecnologia                                          |
| ------------ | --------------------------------------------------- |
| Build        | Vite 8 + TypeScript 6 (`strict: true`)              |
| UI           | React 19, Radix UI (via `@shared/ui`), CSS + tokens |
| Roteamento   | React Router 7                                      |
| Server state | TanStack Query 5                                    |
| Testes       | Vitest + Testing Library + MSW                      |
| Lint         | ESLint                                              |

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

**Fluxo de wiring (futuro):**

```
HttpClient → Repositories → UseCases → Hooks (presentation)
     ↑              ↑            ↑
infrastructure  composition   application
```

---

## Estrutura de pastas

```
src/
├── app/                          # Composition Root
│   ├── main.tsx                  # Entry (StrictMode)
│   ├── App.tsx                   # Shell raiz
│   ├── index.css                 # Reset + estilos base
│   ├── providers/                # QueryProvider, AccessibilityProvider
│   ├── router/                   # React Router + lazy pages
│   └── composition/              # Factories: repos + use cases
│
├── domain/                       # Núcleo — TypeScript puro
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/             # Ports (interfaces)
│   └── errors/
│
├── application/                  # Casos de uso
│   ├── accessibility/
│   ├── tasks/
│   └── profile/
│
├── infrastructure/               # Adaptadores externos
│   ├── api/                      # HttpClient
│   ├── mappers/
│   ├── repositories/
│   └── msw/                      # handlers/, db/, browser.ts, server.ts
│
├── presentation/                 # UI React
│   ├── pages/
│   ├── features/
│   ├── hooks/                    # Adaptadores → use cases
│   └── layouts/
│
└── shared/                       # Cross-cutting
    ├── ui/                       # tokens/, primitives/, components/
    ├── lib/
    ├── constants/
    └── test/                     # setup, renderWithProviders, fixtures
```

---

## Camadas — responsabilidades

| Camada         | Pasta             | Pode importar                                            | Não pode                        | Exemplos                                  |
| -------------- | ----------------- | -------------------------------------------------------- | ------------------------------- | ----------------------------------------- |
| Domain         | `domain/`         | — (núcleo)                                               | React, infrastructure           | `Task.ts`, `ITaskRepository.ts`           |
| Application    | `application/`    | `@domain`                                                | `@infrastructure`, React        | `CompleteTaskStep.ts`                     |
| Infrastructure | `infrastructure/` | `@domain`, `@shared`                                     | `@application`, `@presentation` | `HttpTaskRepository.ts`, `task.mapper.ts` |
| Presentation   | `presentation/`   | `@application`, `@domain`, `@shared`, `@app/composition` | `@infrastructure`, Radix direto | `TaskListPage.tsx`, `useTasks.ts`         |
| App            | `app/`            | Todas (wiring)                                           | Regras de negócio               | `composition/useCases.ts`, `router/`      |
| Shared         | `shared/`         | `radix-ui` (só em `ui/`)                                 | Use cases, pages                | `ui/components/Button/`, `test/setup.ts`  |

---

## Módulos de domínio

| Módulo            | Port                     | Entidades / VOs                                              | Use cases previstos                                |
| ----------------- | ------------------------ | ------------------------------------------------------------ | -------------------------------------------------- |
| **Accessibility** | `IPreferencesRepository` | `AccessibilityPreferences`, `FontSizeLevel`, `ContrastLevel` | Get/Update/Reset preferences                       |
| **Tasks**         | `ITaskRepository`        | `Task`, `TaskStep`, `ActivityHistoryEntry`                   | List, Get, Create, CompleteStep, Complete, History |
| **Profile**       | `IUserRepository`        | `User`, ciclo de vida da conta                               | Get/Update, Deactivate/Reactivate                  |

**Rotas previstas (presentation):**

| Rota              | Página                   |
| ----------------- | ------------------------ |
| `/`               | Dashboard                |
| `/personalizacao` | Painel de personalização |
| `/tarefas`        | Lista de tarefas         |
| `/tarefas/:id`    | Fluxo guiado (wizard)    |
| `/historico`      | Histórico                |
| `/perfil`         | Perfil e configurações   |

**API REST (v1, simulada via MSW):** `GET/PATCH /api/users/:id`, `POST /api/users/:id/deactivate|reactivate`, `DELETE /api/users/:id`, `GET/PUT /api/users/:id/preferences`, `GET/POST /api/tasks`, `GET /api/tasks/:id`, `PATCH /api/tasks/:id/steps/:stepId`, `PATCH /api/tasks/:id/complete`, `GET /api/activities/history`. MVP usa `userId` fixo `"demo-user"`.

Conta: desativação com retenção de 90 dias + reativação no login/cadastro.

**Purge manual (após 90 dias):** script em `scripts/purge-deactivated-accounts.mts`. Apaga Auth + documento Firestore do usuário e subcoleção `activityProgress`. Funciona em produção desde que a service account seja do projeto Firebase correto.

```bash
export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
npm run purge:accounts:dry   # simula
npm run purge:accounts       # executa
```

---

## Práticas do projeto

### Clean Architecture e SOLID

- **SRP** — 1 use case = 1 ação; componentes pequenos e focados
- **DIP** — use cases dependem de ports (interfaces); HTTP só em infrastructure
- **ISP** — ports enxutos por agregado (`IPreferencesRepository`, `ITaskRepository`, `IUserRepository`)
- **KISS** — Context + Query + factories manuais em `app/composition/`; sem Redux/Zustand

### TypeScript

- `strict: true`, props tipadas (`interface XxxProps`), unions discriminadas no domínio
- Aliases entre camadas (`@domain`, `@application`, etc.) — evite caminhos relativos profundos
- Sem `any`; event handlers com tipos nativos do DOM

### Estado

| Tipo                  | Onde                                        |
| --------------------- | ------------------------------------------- |
| Server state (API)    | TanStack Query — não duplicar em `useState` |
| Prefs globais de a11y | `AccessibilityProvider` (Context)           |
| UI local              | `useState` / `useReducer` na feature        |

### UI e acessibilidade

- Radix Primitives **apenas** em `shared/ui/primitives/`; API pública via `@shared/ui`
- HTML semântico primeiro; ARIA só quando necessário
- Labels em PT-BR; touch targets mínimos 44px; respeitar `prefers-reduced-motion`
- Tokens CSS dinâmicos (fonte, contraste, spacing) via `AccessibilityProvider`

### Testes

- Co-localização: `*.test.ts` ao lado do arquivo
- Domain/Application → Vitest unit; Infrastructure → Vitest + MSW; UI → Vitest + RTL
- Helpers reutilizáveis em `@shared/test`

### YAGNI (fora do MVP)

Autenticação real, backend real, i18n, PWA, Tailwind, Redux/Zustand, CQRS, microfrontends, Radix Themes.

---

## Onde colocar código novo

| O quê                                         | Onde                                         |
| --------------------------------------------- | -------------------------------------------- |
| Entidade, VO, port, erro de domínio           | `domain/`                                    |
| Caso de uso                                   | `application/{accessibility,tasks,profile}/` |
| HTTP, mapper, repo, handler MSW               | `infrastructure/`                            |
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

---

## Ordem de implementação (futuro)

1. **Domain** — entidades, VOs, ports, erros
2. **Infrastructure** — HttpClient, MSW, mappers, repos
3. **Application** — use cases por módulo
4. **Composition Root** — factories em `app/composition/`
5. **Shared UI** — tokens + wrappers Radix
6. **Presentation shell** — providers, router, layouts
7. **Features** — personalização, tarefas, perfil
