/**
 * Repositório em memória. Guarda as pessoas indexadas pelo CPF (somente dígitos).
 * Sempre devolve cópias para que o estado interno não seja alterado por fora.
 */
class PessoaRepository {
  constructor() {
    this.pessoas = new Map();
  }

  salvar(pessoa) {
    this.pessoas.set(pessoa.cpf, { ...pessoa });
    return { ...pessoa };
  }

  buscarPorCpf(cpf) {
    const pessoa = this.pessoas.get(cpf);
    return pessoa ? { ...pessoa } : null;
  }

  listar() {
    return [...this.pessoas.values()].map((p) => ({ ...p }));
  }

  remover(cpf) {
    return this.pessoas.delete(cpf);
  }
}

module.exports = PessoaRepository;
