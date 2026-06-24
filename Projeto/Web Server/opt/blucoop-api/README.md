# BluCoop API

Backend Node.js/Express responsável pela autenticação administrativa e pelo CRUD de unidades da BluCoop.

## Arquivos

| Arquivo | Função |
| --- | --- |
| [`server.js`](./server.js) | Código principal da API Express. |
| [`.env.example`](./.env.example) | Modelo seguro das variáveis de ambiente necessárias para execução. |
| [`.gitignore`](./.gitignore) | Evita versionar `.env`, `node_modules` e logs locais do npm. |

## Responsabilidades da API

- Autenticar o usuário administrativo.
- Criar e manter sessão com cookie `blucoop.sid`.
- Proteger rotas administrativas com `requireAuth`.
- Conectar ao PostgreSQL usando `pg`.
- Executar CRUD da tabela `unidades`.
- Retornar respostas JSON para o painel administrativo.
- Aplicar headers anti-cache nas rotas `/api`.

## Variáveis de Ambiente

O backend usa `dotenv`, então as variáveis reais devem ficar em um arquivo `.env` local ou no ambiente do servidor.

Modelo:

```env
PORT=3000

SESSION_SECRET=troque-por-um-segredo-forte

DB_HOST=localhost
DB_PORT=5432
DB_NAME=blucoop
DB_USER=blucoop_user
DB_PASSWORD=troque-por-uma-senha-segura

ADMIN_USER=admin
ADMIN_PASSWORD=troque-por-uma-senha-segura
```

O `.env` real não deve ser versionado.

## Rotas

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/login` | Não | Valida credenciais administrativas e cria sessão. |
| `POST` | `/api/logout` | Não | Encerra a sessão atual. |
| `GET` | `/api/session` | Não | Retorna se há usuário autenticado. |
| `GET` | `/api/unidades` | Sim | Lista todas as unidades cadastradas. |
| `GET` | `/api/unidades/:id` | Sim | Busca uma unidade pelo ID. |
| `POST` | `/api/unidades` | Sim | Cadastra uma nova unidade. |
| `PUT` | `/api/unidades/:id` | Sim | Atualiza uma unidade existente. |
| `DELETE` | `/api/unidades/:id` | Sim | Remove uma unidade. |

## Estrutura Esperada no Banco

```sql
create table unidades (
  id serial primary key,
  nome varchar(100) not null,
  cidade varchar(100) not null,
  colaboradores integer not null,
  maquinas integer not null,
  servidores varchar(150) not null,
  status varchar(30) not null default 'Ativa'
);
```

## Execução

Na EC2, o backend foi executado com PM2:

```bash
cd /opt/blucoop-api
pm2 start server.js --name blucoop-api
pm2 save
pm2 status
```

Para reiniciar após alteração de variáveis:

```bash
pm2 restart blucoop-api --update-env
```

## Integração com o Apache

O Apache encaminha as requisições de `/api` para a API local em `127.0.0.1:3000`:

```apache
ProxyPass /api http://127.0.0.1:3000/api
ProxyPassReverse /api http://127.0.0.1:3000/api
```

Configuração relacionada: [`../../etc/apache2/sites-available/000-default.conf`](../../etc/apache2/sites-available/000-default.conf).

## Materiais Relacionados

- [Documentação da EC2](../../EC2/)
- [Frontend publicado no Apache](../../var/www/html/)
- [README do Web Server](../../)

## Observações de Segurança

Esta API foi desenvolvida como prova de conceito. Para produção, recomenda-se fortalecer autenticação, sessão, auditoria, validação de entrada, proteção contra CSRF, headers de segurança e armazenamento de segredos.
