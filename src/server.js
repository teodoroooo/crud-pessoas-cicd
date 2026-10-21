const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 3000;

createApp().listen(PORT, () => {
  console.info(`API de pessoas rodando em http://localhost:${PORT}`);
});
