const { validarCpf, normalizarCpf, formatarCpf } = require('../utils/cpf');
const { calcularIdade, validarDataNascimento } = require('../utils/idade');
const { ValidationError, NotFoundError, ConflictError } = require('../errors');

const NOME_MIN = 3;
const NOME_MAX = 100;

/**
 * Regras de negócio do CRUD de pessoas.
 * @param {import('../repositories/pessoaRepository')} repository
 * @param {() => Date} [relogio] fonte da data atual (injetável para testes)
 */
class PessoaService {
  constructor(repository, relogio = () => new Date()) {
    this.repository = repository;
    this.relogio = relogio;
  }

  criar(dados) {
    const { cpf, nome, dataNascimento } = dados ?? {};
    if (!validarCpf(cpf)) throw new ValidationError('CPF inválido');

    const pessoa = {
      cpf: normalizarCpf(cpf),
      nome: this.#validarNome(nome),
      dataNascimento: this.#validarData(dataNascimento),
    };
    if (this.repository.buscarPorCpf(pessoa.cpf)) throw new ConflictError();

    return this.#apresentar(this.repository.salvar(pessoa));
  }

  listar() {
    return this.repository.listar().map((p) => this.#apresentar(p));
  }

  buscarPorCpf(cpf) {
    return this.#apresentar(this.#obter(cpf));
  }

  atualizar(cpf, dados) {
    const atual = this.#obter(cpf);
    const { cpf: novoCpf, nome, dataNascimento } = dados ?? {};
    if (novoCpf !== undefined && normalizarCpf(novoCpf) !== atual.cpf) {
      throw new ValidationError('CPF não pode ser alterado');
    }

    const atualizada = {
      ...atual,
      ...(nome !== undefined && { nome: this.#validarNome(nome) }),
      ...(dataNascimento !== undefined && { dataNascimento: this.#validarData(dataNascimento) }),
    };
    return this.#apresentar(this.repository.salvar(atualizada));
  }

  remover(cpf) {
    if (!this.repository.remover(normalizarCpf(cpf))) throw new NotFoundError();
  }

  #obter(cpf) {
    const pessoa = this.repository.buscarPorCpf(normalizarCpf(cpf));
    if (!pessoa) throw new NotFoundError();
    return pessoa;
  }

  #validarNome(nome) {
    const limpo = typeof nome === 'string' ? nome.trim() : '';
    if (limpo.length < NOME_MIN || limpo.length > NOME_MAX) {
      throw new ValidationError(`Nome deve ter entre ${NOME_MIN} e ${NOME_MAX} caracteres`);
    }
    return limpo;
  }

  #validarData(dataNascimento) {
    if (!validarDataNascimento(dataNascimento)) {
      throw new ValidationError('Data de nascimento inválida (use o formato AAAA-MM-DD)');
    }
    try {
      calcularIdade(dataNascimento, this.relogio());
    } catch (erro) {
      throw new ValidationError(erro.message);
    }
    return dataNascimento;
  }

  #apresentar(pessoa) {
    return {
      cpf: formatarCpf(pessoa.cpf),
      nome: pessoa.nome,
      dataNascimento: pessoa.dataNascimento,
      idade: calcularIdade(pessoa.dataNascimento, this.relogio()),
    };
  }
}

module.exports = PessoaService;
