const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Converte uma string no formato AAAA-MM-DD em Date (horário local),
 * retornando null se a data não existir no calendário (ex.: 2001-02-29).
 * @param {string} texto
 * @returns {Date|null}
 */
function parseData(texto) {
  if (typeof texto !== 'string') return null;
  const partes = FORMATO_ISO.exec(texto);
  if (!partes) return null;

  const [ano, mes, dia] = partes.slice(1).map(Number);
  const data = new Date(ano, mes - 1, dia);
  const existe =
    data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
  return existe ? data : null;
}

/**
 * Indica se o valor é uma data de nascimento válida no formato AAAA-MM-DD.
 * @param {unknown} dataNascimento
 * @returns {boolean}
 */
function validarDataNascimento(dataNascimento) {
  return parseData(dataNascimento) !== null;
}

/**
 * Calcula a idade em anos completos.
 * @param {string} dataNascimento data no formato AAAA-MM-DD
 * @param {Date} [hoje] data de referência (padrão: data atual)
 * @returns {number}
 */
function calcularIdade(dataNascimento, hoje = new Date()) {
  const nascimento = parseData(dataNascimento);
  if (!nascimento) throw new Error('Data de nascimento inválida');

  const referencia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (nascimento > referencia) throw new Error('Data de nascimento não pode estar no futuro');

  let idade = referencia.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    referencia.getMonth() < nascimento.getMonth() ||
    (referencia.getMonth() === nascimento.getMonth() &&
      referencia.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade -= 1;
  return idade;
}

module.exports = { calcularIdade, validarDataNascimento };
