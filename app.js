const BACKEND_URL = "https://tu-api-en-render.onrender.com"; // Reemplazar tras desplegar

// Precio unitario actualizado
const PRECIO_UNITARIO = 12500;
let cantidad = 1;

// Elementos del DOM
const cantidadEl = document.getElementById("cantidad");
const totalTextEl = document.getElementById("total-text");
const btnMinus = document.getElementById("btn-minus");
const btnPlus = document.getElementById("btn-plus");

const modal = document.getElementById("modal-checkout");
const btnAbrir = document.getElementById("btn-abrir-checkout");
const btnCerrar = document.getElementById("btn-cerrar-modal");
const form = document.getElementById("form-pedido");
const spinner = document.getElementById("loading-spinner");

// Control de cantidad (+ / -)
btnPlus.addEventListener("click", () => {
    cantidad++;
    actualizarTotal();
});

btnMinus.addEventListener("click", () => {
    if (cantidad > 1) {
        cantidad--;
        actualizarTotal();
    }
});

function actualizarTotal() {
    cantidadEl.innerText = cantidad;
    const total = cantidad * PRECIO_UNITARIO;
    totalTextEl.innerText = `$${total.toLocaleString("es-AR")}`;
}

// Abrir/Cerrar Modal
btnAbrir.addEventListener("click", () => modal.style.display = "flex");
btnCerrar.addEventListener("click", () => modal.style.display = "none");

// Envío del Formulario
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    modal.style.display = "none";
    spinner.style.display = "flex";

    const payload = {
        cliente_nombre: document.getElementById("nombre").value,
        cliente_telefono: document.getElementById("telefono").value,
        direccion: document.getElementById("direccion").value,
        metodo_entrega: document.getElementById("entrega").value,
        cantidad_kg: cantidad
    };

    try {
        const res = await fetch(`${BACKEND_URL}/api/crear-orden`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.init_point) {
            window.location.href = data.init_point; // Redirige a Mercado Pago
        } else {
            alert("Ocurrió un error al generar la orden de pago.");
            spinner.style.display = "none";
        }
    } catch (err) {
        console.error(err);
        alert("Error de conexión con el servidor.");
        spinner.style.display = "none";
    }
});