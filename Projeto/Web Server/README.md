# Web Server

Código e documentação do servidor web utilizado no projeto BluCoop.

O servidor web foi implantado em uma instância EC2 Ubuntu, com Apache servindo o frontend e atuando como proxy reverso para uma API Node.js/Express integrada ao PostgreSQL.

## Componentes

| Componente | Tecnologia | Função |
| --- | --- | --- |
| Frontend público | HTML | Página institucional da BluCoop. |
| Painel administrativo | HTML, CSS e JavaScript | Interface de login e CRUD de unidades. |
| Backend | Node.js, Express e `pg` | API com autenticação, sessão e persistência no PostgreSQL. |
| Proxy reverso | Apache | Entrega do frontend e encaminhamento de `/api` para o Node. |
| Processo da API | PM2 | Execução e gerenciamento do backend na EC2. |

## Estrutura

| Caminho | Descrição |
| --- | --- |
| [EC2/README.md](./EC2/) | Documentação da configuração da instância EC2 como servidor web. |
| `var/www/html/index.html` | Página pública da aplicação web. |
| `var/www/html/admin.html` | Painel administrativo para gerenciamento de unidades. |
| `opt/blucoop-api/server.js` | API Node.js/Express responsável pelas rotas de autenticação e CRUD. |
| `opt/blucoop-api/.env.example` | Modelo seguro das variáveis de ambiente. |
| `etc/apache2/sites-available/000-default.conf` | Configuração do Apache com proxy reverso para a API. |

## Configuração

O arquivo `.env` original não foi versionado por conter variáveis sensíveis. Use `opt/blucoop-api/.env.example` como base para configurar o ambiente local ou de servidor.

## Rotas da API

| Rota | Método | Descrição |
| --- | --- | --- |
| `/api/login` | `POST` | Autentica o usuário administrativo. |
| `/api/logout` | `POST` | Encerra a sessão administrativa. |
| `/api/session` | `GET` | Verifica o estado da sessão. |
| `/api/unidades` | `GET` | Lista unidades cadastradas. |
| `/api/unidades` | `POST` | Cadastra uma nova unidade. |
| `/api/unidades/:id` | `PUT` | Atualiza uma unidade existente. |
| `/api/unidades/:id` | `DELETE` | Remove uma unidade. |

## Documentação Relacionada

- [Configuração da EC2](./EC2/)
- [Entrega da Etapa 2](<../Entregas/Etapa 2/>)
- [Entrega da Etapa 4](<../Entregas/Etapa 4/>)
- [Documentação final](<../Documentação/>)
