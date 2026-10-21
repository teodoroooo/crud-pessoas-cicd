const PessoaService = require('../../src/services/pessoaService');
const PessoaRepository = require('../../src/repositories/pessoaRepository');
const { ValidationError, NotFoundError, ConflictError } = require('../../src/errors');

describe('PessoaService', () => {
  const hoje = () => new Date(2026, 9, 20); // relógio fixo: 20/10/2026
  const maria = { cpf: '529.982.247-25', nome: 'Maria Silva', dataNascimento: '2000-01-15' };
  let service;

  beforeEach(() => {
    service = new PessoaService(new PessoaRepository(), hoje);
  });

  describe('criar', () => {
    it('cria uma pessoa e devolve a idade calculada', () => {
      expect(service.criar(maria)).toEqual({
        cpf: '529.982.247-25',
        nome: 'Maria Silva',
        dataNascimento: '2000-01-15',
        idade: 26,
      });
    });

    it('aceita CPF sem máscara e remove espaços extras do nome', () => {
      const pessoa = service.criar({ ...maria, cpf: '52998224725', nome: '  Maria Silva  ' });
      expect(pessoa.cpf).toBe('529.982.247-25');
      expect(pessoa.nome).toBe('Maria Silva');
    });

    it('rejeita CPF inválido', () => {
      expect(() => service.criar({ ...maria, cpf: '111.111.111-11' })).toThrow(ValidationError);
    });

    it.each(['', '  ', 'Al', null, 'x'.repeat(101)])('rejeita o nome inválido %p', (nome) => {
      expect(() => service.criar({ ...maria, nome })).toThrow('Nome deve ter entre 3 e 100');
    });

    it('rejeita data de nascimento inválida', () => {
      expect(() => service.criar({ ...maria, dataNascimento: '15/01/2000' })).toThrow(
        ValidationError,
      );
    });

    it('rejeita data de nascimento no futuro', () => {
      expect(() => service.criar({ ...maria, dataNascimento: '2027-01-01' })).toThrow(
        'Data de nascimento não pode estar no futuro',
      );
    });

    it('rejeita corpo vazio', () => {
      expect(() => service.criar(undefined)).toThrow(ValidationError);
    });

    it('não permite cadastrar o mesmo CPF duas vezes', () => {
      service.criar(maria);
      expect(() => service.criar({ ...maria, cpf: '52998224725' })).toThrow(ConflictError);
    });
  });

  describe('listar', () => {
    it('retorna lista vazia quando não há pessoas', () => {
      expect(service.listar()).toEqual([]);
    });

    it('retorna todas as pessoas com idade calculada', () => {
      service.criar(maria);
      service.criar({ cpf: '111.444.777-35', nome: 'João Souza', dataNascimento: '1990-12-25' });
      expect(service.listar()).toEqual([
        expect.objectContaining({ nome: 'Maria Silva', idade: 26 }),
        expect.objectContaining({ nome: 'João Souza', idade: 35 }),
      ]);
    });
  });

  describe('buscarPorCpf', () => {
    it('encontra a pessoa com ou sem máscara no CPF', () => {
      service.criar(maria);
      expect(service.buscarPorCpf('52998224725').nome).toBe('Maria Silva');
      expect(service.buscarPorCpf('529.982.247-25').nome).toBe('Maria Silva');
    });

    it('lança NotFoundError quando a pessoa não existe', () => {
      expect(() => service.buscarPorCpf('52998224725')).toThrow(NotFoundError);
    });
  });

  describe('atualizar', () => {
    beforeEach(() => service.criar(maria));

    it('atualiza nome e data de nascimento e recalcula a idade', () => {
      const atualizada = service.atualizar('52998224725', {
        nome: 'Maria Souza',
        dataNascimento: '1995-05-10',
      });
      expect(atualizada).toEqual({
        cpf: '529.982.247-25',
        nome: 'Maria Souza',
        dataNascimento: '1995-05-10',
        idade: 31,
      });
      expect(service.buscarPorCpf('52998224725').nome).toBe('Maria Souza');
    });

    it('permite atualização parcial', () => {
      expect(service.atualizar('52998224725', { nome: 'Maria S.' }).dataNascimento).toBe(
        '2000-01-15',
      );
    });

    it('não permite alterar o CPF', () => {
      expect(() => service.atualizar('52998224725', { cpf: '111.444.777-35' })).toThrow(
        'CPF não pode ser alterado',
      );
    });

    it('valida os novos dados', () => {
      expect(() => service.atualizar('52998224725', { nome: 'A' })).toThrow(ValidationError);
    });

    it('lança NotFoundError quando a pessoa não existe', () => {
      expect(() => service.atualizar('11144477735', { nome: 'Fulano' })).toThrow(NotFoundError);
    });
  });

  describe('remover', () => {
    it('remove a pessoa cadastrada', () => {
      service.criar(maria);
      service.remover('529.982.247-25');
      expect(service.listar()).toEqual([]);
    });

    it('lança NotFoundError quando a pessoa não existe', () => {
      expect(() => service.remover('52998224725')).toThrow(NotFoundError);
    });
  });
});
