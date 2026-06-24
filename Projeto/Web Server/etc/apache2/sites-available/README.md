# Apache Virtual Host

Esta pasta contém a configuração do Apache usada na EC2 do servidor web da BluCoop.

## Arquivo

| Arquivo | Função |
| --- | --- |
| [`000-default.conf`](./000-default.conf) | Virtual host principal do Apache para servir o frontend e encaminhar chamadas da API para o backend Node.js. |

## O Que Esta Configuração Faz

O arquivo `000-default.conf` define o comportamento do Apache na porta `80`:

| Configuração | Uso no projeto |
| --- | --- |
| `ServerName blucoop.click` | Define o domínio principal usado pelo servidor web. |
| `DocumentRoot /var/www/html` | Publica os arquivos HTML do frontend. |
| `Alias /admin /var/www/html/admin.html` | Permite acessar o painel administrativo pela rota `/admin`. |
| `ProxyPass /api http://127.0.0.1:3000/api` | Encaminha requisições `/api` para a API Node.js local. |
| `ProxyPassReverse /api http://127.0.0.1:3000/api` | Ajusta respostas de proxy reverso para a API. |
| `RequestHeader set X-Forwarded-Proto "https"` | Informa ao backend que a requisição pública chegou via HTTPS. |

## Fluxo

```text
Cliente
  |
  v
Apache :80
  |-- /              -> /var/www/html/index.html
  |-- /admin         -> /var/www/html/admin.html
  +-- /api/*         -> http://127.0.0.1:3000/api/*
```

## Módulos Necessários

Para essa configuração funcionar, os módulos abaixo precisam estar habilitados no Apache:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
```

Depois de alterar o virtual host:

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Relação com o Projeto

| Parte | Caminho |
| --- | --- |
| Frontend público e painel admin | [`../../../var/www/html`](../../../var/www/html/) |
| Backend Node.js/Express | [`../../../opt/blucoop-api`](../../../opt/blucoop-api/) |
| Documentação da EC2 | [`../../../EC2`](../../../EC2/) |

## Observação

Esta configuração representa a prova de conceito do projeto. Em um ambiente produtivo, recomenda-se restringir acesso direto à origem, revisar cabeçalhos de segurança e garantir que o tráfego público seja encerrado com HTTPS de forma consistente.
