const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('El servidor de Frutos Rojos está funcionando correctamente');
});

// Ruta para procesar compras o pagos
app.post('/api/crear-preferencia', (req, res) => {
  // Aquí iría la integración con Mercado Pago
  res.json({ mensaje: 'Orden recibida' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});