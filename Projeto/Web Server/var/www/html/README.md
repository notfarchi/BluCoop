# Frontend Web

Esta pasta representa o diretório publicado pelo Apache em `/var/www/html`. Ela contém a página pública da BluCoop e o painel administrativo usado para gerenciar unidades.

## Arquivos

| Arquivo | Rota | Descrição |
| --- | --- | --- |
| [`index.html`](./index.html) | `/` | Página pública institucional da BluCoop. |
| [`admin.html`](./admin.html) | `/admin` | Painel administrativo com login e CRUD de unidades. |

## Página Pública

O arquivo `index.html` apresenta a cooperativa e suas unidades. Ele funciona como a página principal servida pelo Apache a partir do `DocumentRoot`.

## Painel Administrativo

O arquivo `admin.html` implementa:

- Tela de login administrativo.
- Verificação de sessão via `/api/session`.
- Cadastro de unidade via `/api/unidades`.
- Listagem das unidades cadastradas.
- Edição de dados de uma unidade.
- Exclusão de unidade.
- Uso de cookies de sessão com `credentials: 'include'`.

Campos usados no cadastro:

| Campo | Exemplo |
| --- | --- |
| Nome | `Matriz` |
| Cidade | `Blumenau` |
| Colaboradores | `60` |
| Máquinas | `63` |
| Servidores | `3 (DNS, FTP, BD)` |
| Status | `Ativa` ou `Sede` |

## Integração com a API

O painel consome a API Node.js exposta pelo Apache em `/api`.

| Ação no painel | Rota usada |
| --- | --- |
| Login | `POST /api/login` |
| Logout | `POST /api/logout` |
| Verificar sessão | `GET /api/session` |
| Listar unidades | `GET /api/unidades` |
| Criar unidade | `POST /api/unidades` |
| Atualizar unidade | `PUT /api/unidades/:id` |
| Excluir unidade | `DELETE /api/unidades/:id` |

## Relação com o Apache

O Apache publica esta pasta com:

```apache
DocumentRoot /var/www/html
Alias /admin /var/www/html/admin.html
```

Configuração relacionada: [`../../../etc/apache2/sites-available/000-default.conf`](../../../etc/apache2/sites-available/000-default.conf).

## Materiais Relacionados

- [Backend da API](../../../opt/blucoop-api/)
- [Documentação da EC2](../../../EC2/)
- [README do Web Server](../../../)
