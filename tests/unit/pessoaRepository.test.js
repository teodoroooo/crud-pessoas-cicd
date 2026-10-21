const PessoaRepository = require('../../src/repositories/pessoaRepository');

describe('PessoaRepository (em memória)', () => {
  const pessoa = { cpf: '52998224725', nome: 'Maria Silva', dataNascimento: '2000-01-15' };
  let repo;

  beforeEach(() => {
    repo = new PessoaRepository();
  });

  it('salva e busca pelo CPF', () => {
    repo.salvar(pessoa);
    expect(repo.buscarPorCpf('52998224725')).toEqual(pessoa);
  });

  it('retorna null quando o CPF não existe', () => {
    expect(repo.buscarPorCpf('00000000000')).toBeNull();
  });

  it('devolve cópias para evitar alteração externa do estado', () => {
    repo.salvar(pessoa);
    repo.buscarPorCpf('52998224725').nome = 'Alterado';
    expect(repo.buscarPorCpf('52998224725').nome).toBe('Maria Silva');
  });

  it('lista na ordem de inserção', () => {
    repo.salvar(pessoa);
    repo.salvar({ ...pessoa, cpf: '11144477735', nome: 'João' });
    expect(repo.listar().map((p) => p.nome)).toEqual(['Maria Silva', 'João']);
  });

  it('remove e informa se havia registro', () => {
    repo.salvar(pessoa);
    expect(repo.remover('52998224725')).toBe(true);
    expect(repo.remover('52998224725')).toBe(false);
  });
});
