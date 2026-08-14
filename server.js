const express = require("express");
const cors = require("cors");
// Importar Mercado Pago
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

// 1. Configurar tus credenciales de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

app.get("/", (req, res) => {
  res.send("El servidor de Frutos Rojos está funcionando correctamente");
});

// 2. Ruta para crear la preferencia de pago
app.post("/api/crear-orden", async (req, res) => {
  const { cantidad_kg, cliente_nombre } = req.body;
  const precioUnitario = 12500; // Precio por kg

  try {
    const preference = new Preference(client);

    // Crear la preferencia con los datos de la compra
    const result = await preference.create({
      body: {
        items: [
          {
            title: `Frutos Rojos (${cantidad_kg} kg)`,
            quantity: Number(cantidad_kg),
            unit_price: Number(precioUnitario),
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: "https://axloojoaquin-dotcom.github.io/frutosrojosstafe/",
          failure: "https://axloojoaquin-dotcom.github.io/frutosrojosstafe/",
          pending: "https://axloojoaquin-dotcom.github.io/frutosrojosstafe/",
        },
        auto_return: "approved",
      },
    });

    // 3. Responder al frontend con el init_point generado automáticamente
    res.json({
      status: "ok",
      init_point: result.init_point // URL dinámica donde el cliente realiza el pago
    });

  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "Error al generar la orden de pago" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Comprobar si Render leyó la variable
if (!process.env.MP_ACCESS_TOKEN) {
  console.error("❌ ERROR: No se encontró la variable MP_ACCESS_TOKEN");
} else {
  console.log("✅ Variable MP_ACCESS_TOKEN detectada correctamente");
}

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});
