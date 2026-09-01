const BACKEND_URL = "https://frutosrojosstafe.onrender.com";

// ==========================================
// 1. CATÁLOGO DINÁMICO DE PRODUCTOS
// ==========================================
const PRODUCTOS = [
    {
        id: "1",
        nombre: "Mix Frutos Rojos",
        descripcion: "Selección premium de frutillas, frambuesas, moras y arándanos. Ideal para smoothies y postres.",
        precio: 13000,
        badge: "Frescos & Congelados",
        imagen: "producto.jpg",
        visible: true // Cambiar a false si querés ocultarlo
    },
    {
        id: "2",
        nombre: "Arándanos",
        descripcion: "Arándanos seleccionados congelados. Ricos en antioxidantes y sabor natural.",
        precio: 11000,
        badge: "100% Natural",
        imagen: "arandanos.jpg",
        visible: true
    },
    {
        id: "3",
        nombre: "Frutillas",
        descripcion: "Frutillas congeladas al punto justo de maduración. Dulces y listas para usar.",
        precio: 8000,
        badge: "Calidad Premium",
        imagen: "frutillas.jpg",
        visible: true
    }
];

let carrito = [];

// Elementos del DOM
const cartContainer = document.getElementById("cart-items");
const cartTotalText = document.getElementById("cart-total-text");
const btnAbrirCheckout = document.getElementById("btn-abrir-checkout");

const modal = document.getElementById("modal-checkout");
const btnCerrar = document.getElementById("btn-cerrar-modal");
const form = document.getElementById("form-pedido");
const spinner = document.getElementById("loading-spinner");

// ==========================================
// 2. RENDERIZAR PRODUCTOS EN PANTALLA
// ==========================================
function renderizarProductos() {
    const grid = document.querySelector(".products-grid");
    if (!grid) return;

    grid.innerHTML = ""; // Limpiamos la grilla HTML

    // Filtramos solo los productos que tengan visible: true
    const productosVisibles = PRODUCTOS.filter(prod => prod.visible);

    productosVisibles.forEach(prod => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute("data-id", prod.id);
        card.setAttribute("data-nombre", prod.nombre);
        card.setAttribute("data-precio", prod.precio);

        card.innerHTML = `
            <div class="badge">${prod.badge}</div>
            <div class="img-container">
                <img src="${prod.imagen}" alt="${prod.nombre}">
            </div>
            <h2>${prod.nombre} (1kg)</h2>
            <p class="description">${prod.descripcion}</p>
            <div class="price">$${prod.precio.toLocaleString("es-AR")} / kg</div>
            <button class="btn-primary btn-add-cart">Agregar al Carrito</button>
        `;

        // Le agregamos la función al botón de este producto específico
        card.querySelector(".btn-add-cart").addEventListener("click", () => {
            agregarAlCarrito(prod.id, prod.nombre, prod.precio);
        });

        grid.appendChild(card);
    });
}

// Ejecutamos la función apenas cargue la página
document.addEventListener("DOMContentLoaded", renderizarProductos);

// ==========================================
// 3. LÓGICA DEL CARRITO Y CHECKOUT
// ==========================================
function agregarAlCarrito(id, nombre, precio) {
    const existe = carrito.find((item) => item.id === id);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ id, nombre, precio, cantidad: 1 });
    }
    actualizarCarritoUI();
}

// Hacemos global cambiarCantidad para poder usarla en el onclick del HTML generado
window.cambiarCantidad = function(id, cambio) {
    const item = carrito.find((i) => i.id === id);
    if (!item) return;

    item.cantidad += cambio;
    if (item.cantidad <= 0) {
        carrito = carrito.filter((i) => i.id !== id);
    }
    actualizarCarritoUI();
};

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
