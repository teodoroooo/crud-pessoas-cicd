const form = document.getElementById('form');
const campos = ['cpf', 'nome', 'dataNascimento'].map((id) => document.getElementById(id));
const [cpfInput, nomeInput, dataInput] = campos;
const msg = document.getElementById('msg');
const lista = document.getElementById('lista');
const botaoSalvar = document.getElementById('salvar');
const botaoCancelar = document.getElementById('cancelar');
let editando = null;

function mostrar(texto, classe) {
  msg.textContent = texto;
  msg.className = classe;
}

function formatarData(iso) {
  return iso.split('-').reverse().join('/');
}

async function chamar(metodo, url, corpo) {
  const res = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const dados = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(dados.erro);
  return dados;
}

function limpar() {
  form.reset();
  editando = null;
  cpfInput.disabled = false;
  botaoSalvar.textContent = 'Cadastrar';
  botaoCancelar.hidden = true;
}

function linha(pessoa) {
  const tr = document.createElement('tr');
  [pessoa.cpf, pessoa.nome, formatarData(pessoa.dataNascimento), `${pessoa.idade} anos`].forEach(
    (valor) => {
      const td = document.createElement('td');
      td.textContent = valor;
      tr.appendChild(td);
    },
  );
  const acoes = document.createElement('td');
  const editar = document.createElement('button');
  editar.textContent = 'Editar';
  editar.className = 'sec';
  editar.onclick = () => {
    editando = pessoa.cpf;
    cpfInput.value = pessoa.cpf;
    cpfInput.disabled = true;
    nomeInput.value = pessoa.nome;
    dataInput.value = pessoa.dataNascimento;
    botaoSalvar.textContent = 'Salvar';
    botaoCancelar.hidden = false;
  };
  const excluir = document.createElement('button');
  excluir.textContent = 'Excluir';
  excluir.className = 'del';
  excluir.style.marginLeft = '6px';
  excluir.onclick = async () => {
    await chamar('DELETE', `/pessoas/${pessoa.cpf.replace(/\D/g, '')}`);
    mostrar('Pessoa excluída.', 'ok');
    carregar();
  };
  acoes.append(editar, excluir);
  tr.appendChild(acoes);
  return tr;
}

async function carregar() {
  const pessoas = await chamar('GET', '/pessoas');
  lista.replaceChildren(...pessoas.map(linha));
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const dados = { nome: nomeInput.value, dataNascimento: dataInput.value };
  try {
    if (editando) {
      await chamar('PUT', `/pessoas/${editando.replace(/\D/g, '')}`, dados);
      mostrar('Pessoa atualizada.', 'ok');
    } else {
      await chamar('POST', '/pessoas', { cpf: cpfInput.value, ...dados });
      mostrar('Pessoa cadastrada.', 'ok');
    }
    limpar();
    carregar();
  } catch (erro) {
    mostrar(erro.message, 'erro');
  }
});

botaoCancelar.addEventListener('click', limpar);
carregar();
