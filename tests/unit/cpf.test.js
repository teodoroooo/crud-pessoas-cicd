const { validarCpf, normalizarCpf, formatarCpf } = require('../../src/utils/cpf');

describe('normalizarCpf', () => {
  it('remove pontos e traço', () => {
    expect(normalizarCpf('529.982.247-25')).toBe('52998224725');
  });

  it('retorna string vazia para valores que não são texto', () => {
    expect(normalizarCpf(null)).toBe('');
    expect(normalizarCpf(12345678909)).toBe('');
  });
});

describe('validarCpf', () => {
  it.each(['529.982.247-25', '52998224725', '111.444.777-35', '123.456.789-09'])(
    'aceita o CPF válido %s',
    (cpf) => {
      expect(validarCpf(cpf)).toBe(true);
    },
  );

  it('rejeita CPF com dígito verificador errado', () => {
    expect(validarCpf('529.982.247-26')).toBe(false);
    expect(validarCpf('529.982.247-15')).toBe(false);
  });

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(validarCpf('111.111.111-11')).toBe(false);
    expect(validarCpf('00000000000')).toBe(false);
  });

  it.each(['', '123', '529.982.247-2', '5299822472512', 'abc.def.ghi-jk', null, undefined])(
    'rejeita o valor inválido %p',
    (cpf) => {
      expect(validarCpf(cpf)).toBe(false);
    },
  );
});

describe('formatarCpf', () => {
  it('formata um CPF somente com números', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25');
  });
});
