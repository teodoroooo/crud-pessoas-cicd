# CRUD de Pessoas — Integração e Entrega Contínua

[![CI/CD](https://github.com/teodoroooo/crud-pessoas-cicd/actions/workflows/ci.yml/badge.svg)](https://github.com/teodoroooo/crud-pessoas-cicd/actions/workflows/ci.yml)

Aplicação em JavaScript (Node.js + Express) com CRUD de pessoas contendo **CPF**, **nome** e
**data de nascimento**, com **cálculo automático da idade**, desenvolvida com **TDD**.

## Estrutura

```
src/
  app.js                 rotas REST e tratamento de erros
  server.js              ponto de entrada (porta 3000)
  errors.js              erros de domínio (400, 404, 409)
  services/              regras de negócio do CRUD
  repositories/          repositório em memória
  utils/                 validação de CPF e cálculo de idade
public/                  interface web simples
tests/unit/              testes unitários
tests/integration/       testes de integração da API (Supertest)
```

## API

| Método | Rota            | Descrição                                |
| ------ | --------------- | ---------------------------------------- |
| GET    | `/health`       | Verifica se a aplicação está no ar       |
| GET    | `/pessoas`      | Lista as pessoas com a idade calculada   |
| GET    | `/pessoas/:cpf` | Consulta uma pessoa pelo CPF             |
| POST   | `/pessoas`      | Cadastra `{ cpf, nome, dataNascimento }` |
| PUT    | `/pessoas/:cpf` | Atualiza `nome` e/ou `dataNascimento`    |
| DELETE | `/pessoas/:cpf` | Remove uma pessoa                        |

A data de nascimento usa o formato `AAAA-MM-DD`. O CPF é aceito com ou sem máscara.

## Scripts

| Comando                    | Descrição                              |
| -------------------------- | -------------------------------------- |
| `npm start`                | Sobe a API na porta 3000               |
| `npm test`                 | Executa todos os testes com cobertura  |
| `npm run test:unit`        | Executa apenas os testes unitários     |
| `npm run test:integration` | Executa apenas os testes de integração |
| `npm run lint`             | Análise estática com ESLint            |
| `npm run format:check`     | Verifica a formatação com Prettier     |
| `npm run format`           | Formata o código com Prettier          |

## Docker

A imagem é construída e publicada automaticamente pelo pipeline no GitHub Container Registry:

```bash
docker pull ghcr.io/teodoroooo/crud-pessoas-cicd:latest
docker run -p 3000:3000 ghcr.io/teodoroooo/crud-pessoas-cicd:latest
```

Para construir localmente: `docker build -t crud-pessoas .`

## Pipeline (GitHub Actions)

A cada pull request e push na `main`: análise estática (ESLint) → formatação (Prettier) →
testes unitários → testes de integração → build da imagem Docker com teste de fumaça.
Na `main`, a imagem também é publicada no GHCR.
