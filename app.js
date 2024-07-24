const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Configurar middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'gestion_evento')));

// Configurar una ruta para manejar la solicitud de la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'gestion_evento', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor web iniciado en el puerto ${PORT}`);
});
