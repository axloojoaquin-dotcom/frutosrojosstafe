const BACKEND_URL = "https://frutosrojosstafe.onrender.com";

let carrito = [];

// Elementos del DOM
const cartContainer = document.getElementById("cart-items");
const cartTotalText = document.getElementById("cart-total-text");
const btnAbrirCheckout = document.getElementById("btn-abrir-checkout");

const modal = document.getElementById("modal-checkout");
const btnCerrar = document.getElementById("btn-cerrar-modal");
const form = document.getElementById("form-pedido");
const spinner = document.getElementById("loading-spinner");

// Event listeners para agregar productos
document.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const card = e.target.closest(".product-card");
        const id = card.getAttribute("data-id");
        const nombre = card.getAttribute("data-nombre");
        const precio = Number(card.getAttribute("data-precio"));

        agregarAlCarrito(id, nombre, precio);
    });
});

function agregarAlCarrito(id, nombre, precio) {
    const existe = carrito.find((item) => item.id === id);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    actualizarCarritoUI();
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find((i) => i.id === id);
    if (!item) return;

    item.cantidad += cambio;
    if (item.cantidad <= 0) {
        carrito = carrito.filter((i) => i.id !== id);
    }
    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    cartContainer.innerHTML = "";

    if (carrito.length === 0) {
        cartContainer.innerHTML = '<p class="cart-empty">El carrito está vacío.</p>';
        cartTotalText.innerText = "$0";
        btnAbrirCheckout.disabled = true;
        return;
    }

    let total = 0;

    carrito.forEach((item) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <span><strong>${item.nombre}</strong> (${item.cantidad} kg)</span>
            <div class="cart-item-controls">
                <button type="button" onclick="cambiarCantidad('${item.id}', -1)">-</button>
                <span>${item.cantidad}</span>
                <button type="button" onclick="cambiarCantidad('${item.id}', 1)">+</button>
            </div>
            <span>$${subtotal.toLocaleString("es-AR")}</span>
        `;
        cartContainer.appendChild(div);
    });

    cartTotalText.innerText = `$${total.toLocaleString("es-AR")}`;
    btnAbrirCheckout.disabled = false;
}

// Modal control
btnAbrirCheckout.addEventListener("click", () => modal.style.display = "flex");
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
        items: carrito
    };

    try {
        const res = await fetch(`${BACKEND_URL}/api/crear-orden`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.init_point) {
            window.location.href = data.init_point;
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
