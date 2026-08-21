const express = require("express");
const cors = require("cors");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

// Diagnóstico e inicialización de Mercado Pago
if (!process.env.MP_ACCESS_TOKEN) {
  console.error("❌ ERROR: No se encontró la variable MP_ACCESS_TOKEN en las variables de entorno.");
} else {
  console.log("✅ Variable MP_ACCESS_TOKEN detectada correctamente.");
}

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || ""
});

app.get("/", (req, res) => {
  res.send("El servidor de Frutos Rojos está funcionando correctamente");
});

// Ruta para crear la preferencia de pago
app.post("/api/crear-orden", async (req, res) => {
  const { items } = req.body;

  try {
    const preference = new Preference(client);

    // Mapeamos los ítems que llegan desde el frontend
    const mpItems = items.map((prod) => ({
      title: `${prod.nombre} (${prod.cantidad} kg)`,
      quantity: Number(prod.cantidad),
      unit_price: Number(prod.precio),
      currency_id: "ARS",
    }));

    const result = await preference.create({
      body: {
        items: mpItems,
        back_urls: {
          success: "https://axloojoaquin-dotcom.github.io/frutosrojosstafe/",
          failure: "https://axloojoaquin-dotcom.github.io/frutosrojosstafe/",
          pending: "https://axloojoaquin-dotcom.github.io/frutosrojosstafe/",
        },
        auto_return: "approved",
      },
    });

    res.json({
      status: "ok",
      init_point: result.init_point
    });

  } catch (error) {
    console.error("Error exacto al crear preferencia en Mercado Pago:", error);
    res.status(500).json({ 
      error: "Error al generar la orden de pago", 
      detalles: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
