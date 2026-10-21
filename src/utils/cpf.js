/**
 * Remove qualquer caractere que não seja dígito.
 * @param {unknown} cpf
 * @returns {string}
 */
function normalizarCpf(cpf) {
  return typeof cpf === 'string' ? cpf.replace(/\D/g, '') : '';
}

/**
 * Calcula um dígito verificador do CPF a partir dos dígitos anteriores.
 * @param {string} base
 * @returns {number}
 */
function digitoVerificador(base) {
  const pesoInicial = base.length + 1;
  const soma = [...base].reduce((acc, digito, i) => acc + Number(digito) * (pesoInicial - i), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/**
 * Valida um CPF (com ou sem máscara) pelo algoritmo dos dígitos verificadores.
 * @param {unknown} cpf
 * @returns {boolean}
 */
function validarCpf(cpf) {
  if (typeof cpf !== 'string' || /[^\d.\-\s]/.test(cpf)) return false;
  const numeros = normalizarCpf(cpf);
  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) return false;

  const dv1 = digitoVerificador(numeros.slice(0, 9));
  const dv2 = digitoVerificador(numeros.slice(0, 10));
  return dv1 === Number(numeros[9]) && dv2 === Number(numeros[10]);
}

/**
 * Formata 11 dígitos no padrão 000.000.000-00.
 * @param {string} cpf
 * @returns {string}
 */
function formatarCpf(cpf) {
  return normalizarCpf(cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

module.exports = { validarCpf, normalizarCpf, formatarCpf };
