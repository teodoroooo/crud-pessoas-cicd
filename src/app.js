const path = require('path');
const express = require('express');
const PessoaRepository = require('./repositories/pessoaRepository');
const PessoaService = require('./services/pessoaService');
const { AppError } = require('./errors');

/**
 * Monta a aplicação Express. As dependências podem ser injetadas (útil nos testes).
 * @param {{ service?: PessoaService, relogio?: () => Date }} [deps]
 */
function createApp({ relogio, service = new PessoaService(new PessoaRepository(), relogio) } = {}) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.get('/pessoas', (_req, res) => res.json(service.listar()));

  app.get('/pessoas/:cpf', (req, res) => res.json(service.buscarPorCpf(req.params.cpf)));

  app.post('/pessoas', (req, res) => {
    const pessoa = service.criar(req.body);
    res
      .status(201)
      .location(`/pessoas/${pessoa.cpf.replace(/\D/g, '')}`)
      .json(pessoa);
  });

  app.put('/pessoas/:cpf', (req, res) => res.json(service.atualizar(req.params.cpf, req.body)));

  app.delete('/pessoas/:cpf', (req, res) => {
    service.remover(req.params.cpf);
    res.status(204).end();
  });

  // O Express identifica o handler de erro pelos 4 parâmetros, por isso _next é mantido.
  app.use((err, _req, res, _next) => {
    if (err instanceof AppError) return res.status(err.statusCode).json({ erro: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido' });
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  });

  return app;
}

module.exports = { createApp };
