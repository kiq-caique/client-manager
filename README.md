# ClientManager 🧑‍💼

Aplicação Angular de gestão de clientes, desenvolvida como teste técnico para vaga de Desenvolvedor Front-end Angular Pleno.

---

## ✨ Funcionalidades

| Funcionalidade | Implementado |
|---|---|
| Listagem de clientes | ✅ |
| Cadastro de novo cliente | ✅ |
| Edição de cliente existente | ✅ |
| Exclusão com confirmação | ✅ |
| Busca em tempo real | ✅ |
| Paginação e ordenação | ✅ |
| Autenticação (login/logout) | ✅ |
| Proteção de rotas (Guards) | ✅ |
| Interceptor JWT | ✅ |
| Lazy Loading de módulos | ✅ |
| Formulários reativos + validação | ✅ |
| Validação de CPF e CNPJ | ✅ |
| Gerenciamento de estado (RxJS) | ✅ |
| Angular Material | ✅ |
| Testes unitários | ✅ |

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js **18+**
- npm **9+**
- Angular CLI **17+**

```bash
npm install -g @angular/cli
```

### Instalação

```bash
# Clone ou baixe o projeto
git clone https://github.com/seu-usuario/client-manager.git
cd client-manager

# Instale as dependências
npm install

# Rode o servidor de desenvolvimento
npm start
```

Acesse: **http://localhost:4200**

### Credenciais de demo

| Campo | Valor |
|---|---|
| E-mail | `admin@clientmanager.dev` |
| Senha | `admin123` |

---

## 🧪 Testes

```bash
# Executar testes unitários
npm test

# Com cobertura
npm test -- --code-coverage
```

### Cobertura de testes
- `AuthService` — login, logout, validação de token
- `ClientService` — CRUD completo, busca, erros
- `DocumentMaskPipe` — formatação CPF/CNPJ

---

## 🏗️ Arquitetura

```
src/app/
├── core/                    # Singleton: guards, interceptors, models, services
│   ├── guards/
│   │   └── auth.guard.ts   # authGuard (protege /clients) + guestGuard (protege /auth)
│   ├── interceptors/
│   │   └── auth.interceptor.ts  # Injeta Bearer token + trata 401
│   ├── models/
│   │   ├── auth.model.ts
│   │   └── client.model.ts
│   └── services/
│       ├── auth.service.ts      # Estado de autenticação (BehaviorSubject)
│       └── client.service.ts    # CRUD + estado de clientes (BehaviorSubject + localStorage)
│
├── shared/                  # Módulo compartilhado
│   ├── components/
│   │   └── confirm-dialog.component.ts  # Diálogo de confirmação reutilizável
│   ├── pipes/
│   │   └── document-mask.pipe.ts        # Formata CPF/CNPJ
│   └── shared.module.ts     # Re-exporta Material + pipes + CommonModule
│
└── features/                # Feature modules com Lazy Loading
    ├── auth/
    │   ├── auth.module.ts
    │   └── pages/login/     # Página de login
    └── clients/
        ├── clients.module.ts
        ├── clients-layout.component.ts  # Shell com topbar
        └── pages/
            ├── list/        # Listagem com tabela, busca, paginação
            └── form/        # Cadastro/edição com formulário reativo
```

### Padrões e decisões técnicas

- **Lazy Loading**: Os módulos `auth` e `clients` são carregados sob demanda via `loadChildren`.
- **Guards funcionais**: `authGuard` e `guestGuard` no formato funcional do Angular 15+.
- **Estado reativo**: `ClientService` e `AuthService` expõem `Observable` via `BehaviorSubject`, garantindo reatividade sem biblioteca externa.
- **Persistência local**: O CRUD usa `localStorage` como simulação de API, com seed de dados iniciais.
- **Validação de CPF/CNPJ**: Validadores customizados com algoritmo de dígito verificador.
- **Interceptor HTTP**: Injeta o token JWT em todas as requisições e trata 401 automaticamente.
- **Formulários reativos**: `FormBuilder`, `FormGroup`, `Validators` e validadores customizados.
- **Angular Material**: Tema escuro personalizado com CSS custom properties.

---

## 🛠️ Build para produção

```bash
npm run build
```

Os artefatos estarão em `dist/client-manager/`.

---

## 📦 Tecnologias

- Angular 17
- Angular Material 17
- RxJS 7
- TypeScript 5.4
- SCSS
