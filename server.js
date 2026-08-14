const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors()); // Importante para permitir conexiones desde GitHub Pages
app.use(express.json());

app.get("/", (req, res) => {
  res.send("El servidor de Frutos Rojos está funcionando correctamente");
});

// Esta es la ruta que llama tu app.js:
app.post("/api/crear-orden", async (req, res) => {
  const { cliente_nombre, cliente_telefono, direccion, metodo_entrega, cantidad_kg } = req.body;

  try {
    // Aquí agregas la lógica con Mercado Pago o tu respuesta
    // Por ejemplo, para probar:
    res.json({ 
      status: "ok",
      init_point: "https://www.mercadopago.com.ar" // Aquí irá tu link dinámico de MP
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
