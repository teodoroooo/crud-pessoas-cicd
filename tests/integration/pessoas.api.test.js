const request = require('supertest');
const { createApp } = require('../../src/app');

describe('API /pessoas (integração)', () => {
  const relogio = () => new Date(2026, 9, 20); // 20/10/2026
  const maria = { cpf: '529.982.247-25', nome: 'Maria Silva', dataNascimento: '2000-01-15' };
  let app;

  beforeEach(() => {
    app = createApp({ relogio });
  });

  it('GET /health responde que a aplicação está no ar', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  describe('POST /pessoas', () => {
    it('cria uma pessoa e retorna 201 com a idade calculada', async () => {
      const res = await request(app).post('/pessoas').send(maria);
      expect(res.status).toBe(201);
      expect(res.headers.location).toBe('/pessoas/52998224725');
      expect(res.body).toEqual({ ...maria, idade: 26 });
    });

    it('retorna 400 para CPF inválido', async () => {
      const res = await request(app)
        .post('/pessoas')
        .send({ ...maria, cpf: '123.456.789-00' });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: 'CPF inválido' });
    });

    it('retorna 400 para JSON malformado', async () => {
      const res = await request(app)
        .post('/pessoas')
        .set('Content-Type', 'application/json')
        .send('{"cpf": ');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: 'JSON inválido' });
    });

    it('retorna 409 para CPF já cadastrado', async () => {
      await request(app).post('/pessoas').send(maria);
      const res = await request(app).post('/pessoas').send(maria);
      expect(res.status).toBe(409);
    });
  });

  describe('fluxo completo do CRUD', () => {
    it('cria, lista, consulta, atualiza e remove uma pessoa', async () => {
      await request(app).post('/pessoas').send(maria).expect(201);

      const lista = await request(app).get('/pessoas').expect(200);
      expect(lista.body).toHaveLength(1);

      const consulta = await request(app).get('/pessoas/52998224725').expect(200);
      expect(consulta.body.nome).toBe('Maria Silva');

      const atualizada = await request(app)
        .put('/pessoas/529.982.247-25')
        .send({ nome: 'Maria Souza', dataNascimento: '1995-05-10' })
        .expect(200);
      expect(atualizada.body).toMatchObject({ nome: 'Maria Souza', idade: 31 });

      await request(app).delete('/pessoas/52998224725').expect(204);
      await request(app).get('/pessoas/52998224725').expect(404);
      const vazia = await request(app).get('/pessoas').expect(200);
      expect(vazia.body).toEqual([]);
    });
  });

  describe('erros', () => {
    it('GET /pessoas/:cpf retorna 404 quando não existe', async () => {
      const res = await request(app).get('/pessoas/11144477735');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ erro: 'Pessoa não encontrada' });
    });

    it('PUT /pessoas/:cpf retorna 400 ao tentar alterar o CPF', async () => {
      await request(app).post('/pessoas').send(maria);
      const res = await request(app).put('/pessoas/52998224725').send({ cpf: '111.444.777-35' });
      expect(res.status).toBe(400);
    });

    it('DELETE /pessoas/:cpf retorna 404 quando não existe', async () => {
      await request(app).delete('/pessoas/11144477735').expect(404);
    });

    it('retorna 500 genérico para erros inesperados', async () => {
      const service = {
        listar: () => {
          throw new Error('falha no banco');
        },
      };
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const res = await request(createApp({ service })).get('/pessoas');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ erro: 'Erro interno do servidor' });
      spy.mockRestore();
    });
  });
});
