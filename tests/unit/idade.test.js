const { calcularIdade, validarDataNascimento } = require('../../src/utils/idade');

describe('calcularIdade', () => {
  const hoje = new Date(2026, 9, 20); // 20/10/2026

  it('calcula a idade quando o aniversário já passou no ano', () => {
    expect(calcularIdade('2000-01-15', hoje)).toBe(26);
  });

  it('calcula a idade quando o aniversário ainda não chegou no ano', () => {
    expect(calcularIdade('2000-12-25', hoje)).toBe(25);
  });

  it('considera que a pessoa faz aniversário no próprio dia', () => {
    expect(calcularIdade('2000-10-20', hoje)).toBe(26);
  });

  it('ainda não completou ano na véspera do aniversário', () => {
    expect(calcularIdade('2000-10-21', hoje)).toBe(25);
  });

  it('retorna 0 para quem nasceu hoje', () => {
    expect(calcularIdade('2026-10-20', hoje)).toBe(0);
  });

  it('trata corretamente quem nasceu em 29 de fevereiro', () => {
    expect(calcularIdade('2004-02-29', new Date(2026, 1, 28))).toBe(21);
    expect(calcularIdade('2004-02-29', new Date(2026, 2, 1))).toBe(22);
  });

  it('usa a data atual quando "hoje" não é informado', () => {
    const anoPassado = new Date().getFullYear() - 1;
    expect(calcularIdade(`${anoPassado}-01-01`)).toBe(1);
  });

  it('lança erro para data inválida', () => {
    expect(() => calcularIdade('2000-02-30', hoje)).toThrow('Data de nascimento inválida');
  });

  it('lança erro para data no futuro', () => {
    expect(() => calcularIdade('2030-01-01', hoje)).toThrow(
      'Data de nascimento não pode estar no futuro',
    );
  });
});

describe('validarDataNascimento', () => {
  it.each(['2000-01-01', '1985-12-31', '2004-02-29'])('aceita a data válida %s', (data) => {
    expect(validarDataNascimento(data)).toBe(true);
  });

  it.each(['', null, undefined, 123, '01/01/2000', '2000-13-01', '2001-02-29', '2000-1-1'])(
    'rejeita o valor inválido %p',
    (data) => {
      expect(validarDataNascimento(data)).toBe(false);
    },
  );
});
