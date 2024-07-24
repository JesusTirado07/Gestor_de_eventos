const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'gestion_evento')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'gestion_evento', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor web iniciado en el puerto ${PORT}`);
});
