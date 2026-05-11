# Guia de Defesa do Projeto — Client Manager (Angular Pleno)

Este documento explica, peça por peça, **o que foi feito**, **por que foi feito assim** e **o que se faria em produção**. Use como roteiro para defender o teste técnico.

---

## 1. Visão geral

Aplicação Angular 17 que simula um CRUD de clientes (listar, criar, editar, excluir), com:

- Autenticação fake com token (JWT mockado em `localStorage`)
- Rotas protegidas por **guards**
- **HTTP Interceptor** anexando o token e tratando 401
- **Lazy loading** dos módulos `auth` e `clients`
- **Formulários reativos** com validadores customizados de CPF/CNPJ
- **Angular Material** como UI
- **RxJS / BehaviorSubject** como gerenciamento de estado
- Testes unitários com **Jasmine + Karma + TestBed**

Tudo o que o PDF lista como "diferencial" (auth, interceptors, lazy loading, testes, Material, guards) está contemplado.

---

## 2. Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Angular 17 (NgModules) | Versão estável, ainda com NgModules — facilita demonstrar conhecimento da arquitetura "clássica" que a maioria das empresas usa em produção. |
| UI | Angular Material 17 | O PDF pediu Material se fosse usar lib de UI. Tema, acessibilidade e tipografia já vêm prontos. |
| Estado | RxJS + `BehaviorSubject` | Para escopo pequeno é o suficiente. Evita over-engineering. |
| Forms | `ReactiveFormsModule` | Pedido explicitamente no teste. |
| Testes | Jasmine + Karma + TestBed | Padrão Angular CLI. |
| Persistência | `localStorage` | Simula API conforme permitido pelo PDF. |

---

## 3. Estrutura de pastas

```
src/app/
├── core/                      # Singletons globais — instanciados 1 vez
│   ├── guards/                # authGuard, guestGuard
│   ├── interceptors/          # AuthInterceptor
│   ├── models/                # Tipagens (Client, User…)
│   └── services/              # AuthService, ClientService
├── shared/                    # Reaproveitável entre features
│   ├── components/            # ConfirmDialog
│   ├── pipes/                 # DocumentMaskPipe
│   └── shared.module.ts       # Exporta Material + Common + Forms
├── features/                  # Domínios de negócio
│   ├── auth/                  # Login (lazy)
│   └── clients/               # CRUD de clientes (lazy)
├── app.component.ts           # Shell — apenas <router-outlet>
├── app.module.ts              # Root module
└── app-routing.module.ts      # Rotas raiz + lazy loading
```

### Por que essa separação?

É o padrão **Core / Shared / Features** que o Angular team recomenda há anos.

- **Core**: coisas que devem existir uma única vez na aplicação (services singletons, guards, interceptors).
- **Shared**: o que vários módulos consomem (componentes burros, pipes, diretivas, re-export do Material).
- **Features**: cada domínio isolado, idealmente lazy-loaded.

Resultado: módulos pequenos, baixo acoplamento, fácil de evoluir.

---

## 4. Bootstrap — `main.ts` e `AppModule`

```ts
// main.ts
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

`platformBrowserDynamic` faz JIT (compila no browser em dev). Em produção o build de produção do Angular CLI já gera AOT — mais rápido e seguro.

```ts
// app.module.ts
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,              // necessário no root
    BrowserAnimationsModule,    // exigido pelo Material (animações)
    HttpClientModule,           // disponibiliza HttpClient global
    MatSnackBarModule,          // snackbar precisa estar global
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
```

Pontos para defender:

- `multi: true` no `HTTP_INTERCEPTORS` é obrigatório — é um array de interceptors.
- `MatSnackBarModule` precisa estar no root porque é invocado por serviços (como o interceptor).
- `AppComponent` é só um shell: `<router-outlet>`. Cada rota injeta seu próprio layout.

---

## 5. Roteamento + Lazy Loading

```ts
const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'clients',
    canActivate: [authGuard],
    loadChildren: () => import('./features/clients/clients.module').then(m => m.ClientsModule)
  },
  { path: '', redirectTo: 'clients', pathMatch: 'full' },
  { path: '**', redirectTo: 'clients' }
];
```

**Lazy loading** com `loadChildren` + `import()` dinâmico. Webpack/esbuild gera um chunk separado para cada feature. Vantagens:

- Bundle inicial menor → primeiro carregamento mais rápido.
- O módulo só sobe quando o usuário navega para a rota.

**Guards**: `canActivate` é a função que bloqueia/permite o acesso. Em Angular 17 são funções (`CanActivateFn`) — substituíram as classes antigas.

---

## 6. Guards (`auth.guard.ts`)

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn) return true;
  router.navigate(['/auth/login']);
  return false;
};
```

- `inject()` é a forma funcional de obter dependências (sem constructor).
- `guestGuard` faz o oposto — bloqueia a rota de login para quem já está autenticado.

**Em produção**: o guard checaria validade do token (expiração JWT), poderia ser assíncrono retornando `Observable<boolean>` para validar com o backend.

---

## 7. HTTP Interceptor (`auth.interceptor.ts`)

```ts
intercept(req, next) {
  const token = this.auth.token;
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next.handle(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        this.auth.logout();
        this.snackBar.open('Sessão expirada. Faça login novamente.', 'OK', { duration: 4000 });
      }
      return throwError(() => error);
    })
  );
}
```

Faz duas coisas clássicas de interceptor:

1. **Anexa o token** em toda requisição HTTP saindo da app.
2. **Trata 401** globalmente — desloga e mostra mensagem.

`req.clone()` é necessário porque `HttpRequest` é imutável.

**Em produção** acrescentaríamos:

- **Refresh token** antes de deslogar
- **Retry** com `retry()` ou `retryWhen()` para erros 5xx
- **Loading global** (incrementar/decrementar um BehaviorSubject)
- **Logging** estruturado / Sentry

---

## 8. AuthService (`core/services/auth.service.ts`)

```ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser$ = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this._currentUser$.asObservable();
  // ...
}
```

Pontos importantes:

- `providedIn: 'root'` → singleton em toda a app, tree-shakable.
- `BehaviorSubject` mantém o "estado atual" e emite o último valor para novos `subscribe`. Perfeito para "usuário logado".
- `asObservable()` expõe só leitura — quem consome não consegue dar `.next()`.
- Persiste sessão em `localStorage` (sobrevive a refresh).
- `login()` retorna `Observable<User>` simulando uma chamada HTTP com `delay(800)`.

**Em produção**:

- Token JWT real, com decode (lib `jwt-decode`) para ler expiração.
- `sessionStorage` ou cookie `httpOnly` (mais seguro contra XSS).
- Refresh token rotativo.

---

## 9. ClientService — CRUD + State (`client.service.ts`)

```ts
private _clients$ = new BehaviorSubject<Client[]>(this.load());
clients$: Observable<Client[]> = this._clients$.asObservable();

getAll(): Observable<Client[]> { return this.clients$.pipe(delay(300)); }
create(form): Observable<Client> { /* push em _clients$ e persiste */ }
update(id, form) { /* map em _clients$ */ }
delete(id) { /* filter em _clients$ */ }
search(term) { /* map + filter sobre clients$ */ }
```

A *store* é o próprio `BehaviorSubject`. Quem assina `clients$` recebe atualizações automaticamente — o `MatTable` na listagem reflete create/update/delete sem precisar de F5.

**Decisão arquitetural**: para um CRUD pequeno, `BehaviorSubject` é mais simples que NgRx/Akita e dá os mesmos resultados.

**Em produção / projeto grande**:

- **NgRx** (Redux pattern) → store global, actions, reducers, effects, devtools.
- **NgRx Signal Store** (mais novo) ou **Akita** / **Elf** se quiser algo mais leve.
- `HttpClient` real chamando uma API REST/GraphQL.

---

## 10. Formulários Reativos (`client-form-page.component.ts`)

```ts
this.form = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)]],
  documentType: ['CPF', Validators.required],
  document: ['', [Validators.required, this.documentValidator.bind(this)]]
});
```

Coisas que valem ouro na entrevista:

- **FormBuilder** com `fb.group` evita instanciar `FormControl` à mão.
- Validators **built-in**: `required`, `email`, `minLength`, `pattern`.
- Validator **customizado** dinâmico: `documentValidator` consulta `documentType` e roda o algoritmo de CPF ou CNPJ.
- **Cross-field validation**: ao mudar o `documentType`, faz `updateValueAndValidity()` no campo `document` para revalidar.
- `markAllAsTouched()` no submit força exibir todos os erros.
- Padrão "patchValue" no modo edição (carrega o cliente e popula o form).

```ts
this.form.get('documentType')?.valueChanges.subscribe(() => {
  this.form.get('document')?.updateValueAndValidity();
});
```

Esse é o tipo de detalhe que mostra que você entende o ciclo de vida do form.

**Em produção** se faria:

- Diretivas de **máscara** (ex.: `ngx-mask`) para CPF/CNPJ/telefone.
- Validators assíncronos (`AsyncValidator`) consultando backend (ex.: "esse CPF já existe?").
- `takeUntilDestroyed()` ou padrão `Subject` + `takeUntil` para evitar memory leak nos subscribes.

---

## 11. Validadores de CPF e CNPJ

Implementação manual do algoritmo oficial da Receita Federal — dois dígitos verificadores baseados em multiplicações por pesos. Rejeita também sequências repetidas tipo `11111111111`.

**Em produção**: usaríamos `@brazilian-utils/brazilian-utils` ou similar, já testada em milhares de projetos.

---

## 12. Listagem com `MatTable` (`client-list-page.component.ts`)

```ts
dataSource = new MatTableDataSource<Client>();

ngAfterViewInit() {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
  this.dataSource.sortingDataAccessor = (item, prop) =>
    (item as unknown as Record<string, string>)[prop] ?? '';
}
```

- `MatTableDataSource` já entrega **paginação**, **ordenação** e **filtro** out of the box.
- `searchControl` (FormControl avulso) com **`debounceTime(300)` + `distinctUntilChanged()`** evita filtrar a cada tecla — clássica otimização de busca.
- `sortingDataAccessor` customizado: o Material precisa de uma função para saber como extrair valores de propriedades dinâmicas. O cast `as unknown as Record<string, string>` foi necessário porque `Client` é uma interface com chaves fixas — TypeScript estrito não deixa indexar com `string` genérica.

---

## 13. ConfirmDialog (`shared/components/confirm-dialog.component.ts`)

Diálogo de confirmação reutilizável, declarado como **standalone component**:

```ts
@Component({
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  // ...
})
```

`MAT_DIALOG_DATA` injeta os dados; `MatDialogRef` permite fechar retornando true/false.

**Em produção**: bom expor um service `ConfirmService.ask(title, message)` para esconder a chamada do `MatDialog` e ganhar tipagem.

---

## 14. Pipes — `DocumentMaskPipe`

```ts
transform(value: string, type: 'CPF' | 'CNPJ'): string {
  const digits = value.replace(/\D/g, '');
  if (type === 'CPF') return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
```

Pipe puro (default) — Angular memoriza o resultado se o input não mudar. Performance grátis.

---

## 15. Testes (`*.spec.ts`)

Cobre `ClientService` com:

- Carregamento do seed
- Create / Update / Delete
- Busca por nome
- Erro para id inválido

Cada teste limpa `localStorage` no `beforeEach` (isolamento). Usa `TestBed.inject()` para pegar o serviço sob teste, e callbacks `done()` por trabalhar com Observables com `delay`.

**Em produção** acrescentaríamos:

- Testes de **componente** com `ComponentFixture` (interagir com DOM).
- Testes de **integração** com Cypress / Playwright.
- **MSW** (Mock Service Worker) para mockar HTTP em testes.
- Cobertura mínima no CI (ex.: 80%).

---

## 16. Angular Material (`shared.module.ts`)

Por que centralizar tudo num `SharedModule`?

- Cada feature module faz **um** `import: [SharedModule]` em vez de listar 15 módulos do Material.
- Se um dia trocar de lib de UI, mexe em um arquivo só.

Módulos usados: Button, Icon, Input, FormField, Select, Table, Paginator, Sort, Dialog, SnackBar, ProgressSpinner, Chips, Tooltip, Menu, Card, Badge.

---

## 17. O que foi corrigido para o projeto rodar

Três problemas estavam impedindo o build:

### 17.1 `tsconfig.json` — `baseUrl` faltando
Os paths `@core/*`, `@shared/*`, `@features/*` só funcionam se houver `baseUrl`. Adicionado `"baseUrl": "./"`.

### 17.2 `client.service.ts` — import de `uuid` inexistente
O arquivo importava `v4 as uuidv4` de `uuid`, mas:
- `uuid` não estava no `package.json`.
- Já havia uma função `uuidv4()` polyfill no fim do arquivo (Math.random com regex).

Solução: remover o import. A polyfill já cobre o uso.

### 17.3 `client-list-page.component.ts` — cast estrito demais
`item as Record<string, string>` falha porque `Client` tem chaves fixas. O próprio compilador sugere passar por `unknown`. Trocado para `item as unknown as Record<string, string>`.

---

## 18. Como executar

```bash
npm install
npm start
# abre http://localhost:4200
# login: admin@clientmanager.dev / admin123
```

---

## 19. Pontos fortes do projeto para destacar na entrevista

1. **Arquitetura limpa** — Core/Shared/Features, módulos pequenos, sem ciclos.
2. **Lazy loading** funcional nas duas features.
3. **Guards funcionais** (`CanActivateFn` — padrão moderno do Angular 17).
4. **Interceptor** anexando token e tratando 401 globalmente.
5. **Validadores customizados** com algoritmo real de CPF/CNPJ.
6. **Cross-field validation** com `valueChanges` + `updateValueAndValidity`.
7. **State** com `BehaviorSubject` + observables imutáveis.
8. **Persistência** com `localStorage`.
9. **Testes unitários** com Jasmine.
10. **`debounceTime` + `distinctUntilChanged`** na busca.
11. **Standalone Component** no `ConfirmDialog` (mostra que conhece o novo padrão Angular).
12. **Pipes puros** para formatação.

---

## 20. Limitações honestas (boa coisa de já antecipar)

- Persistência em `localStorage` (não tem backend real).
- Validador de telefone aceita só padrão brasileiro.
- Não tem internacionalização (`i18n`).
- Não tem dark mode toggle.
- Falta de testes de componente (só de service).
- Polyfill de `uuid` não é criptograficamente segura — em produção usar `crypto.randomUUID()`.

---

## 21. Próximos passos plausíveis em produção

| Área | Hoje | Em produção |
|---|---|---|
| API | localStorage | HttpClient + REST/GraphQL backend |
| Token | string fake | JWT com refresh, decode, expiração |
| State | BehaviorSubject | NgRx Store + Effects + DevTools |
| Forms | Validators inline | Validators em arquivo separado + AsyncValidators |
| Máscaras | regex no pipe | `ngx-mask` no input |
| Erros | snackbar simples | Sentry + retry policy + boundary component |
| Testes | unidade do service | Componentes + E2E (Cypress/Playwright) + MSW |
| CI/CD | nenhum | GitHub Actions: lint + test + build + deploy |
| UI | tema padrão | Design system próprio, dark mode, i18n |
| Auth | mock | OAuth2 / OpenID Connect (Keycloak, Auth0) |

---

## 22. Glossário rápido (caso pergunte)

- **NgModule**: agrupa componentes, diretivas, pipes e serviços. Em Angular 14+ é opcional (standalone), mas ainda é o padrão em produção.
- **Standalone Component**: componente que se declara sozinho, sem precisar de NgModule. Importa suas próprias dependências.
- **`providedIn: 'root'`**: serviço singleton em toda a app; tree-shakable (sumiria do bundle se ninguém usasse).
- **`BehaviorSubject` vs `Subject`**: `BehaviorSubject` guarda o último valor e emite imediatamente para novos subscribers. `Subject` não guarda histórico.
- **`Observable` vs `Promise`**: Observable é lazy (só executa no `subscribe`), cancelável, pode emitir vários valores. Promise é eager, dispara uma vez.
- **AOT**: Ahead-of-Time compilation — Angular compila os templates no build, não no browser. Build de produção sempre é AOT.
- **Change Detection**: `Default` (Zone.js — verifica tudo) vs `OnPush` (só quando `@Input` muda ou `Observable | async` emite). `OnPush` é otimização clássica.
- **Tree-shaking**: build remove código não usado. Standalone + `providedIn: 'root'` ajudam.
- **Lazy loading**: o Webpack/esbuild quebra o módulo em chunk separado e só baixa quando a rota é acessada.
