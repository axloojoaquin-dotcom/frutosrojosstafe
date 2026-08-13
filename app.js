// Reemplaza esta URL cuando despliegues el Backend en Render
const API_URL = 'https://tu-backend.onrender.com/api'; 

let cantidad = 1;
const precioUnitario = 8500;

// Referencias al DOM
const qtyDisplay = document.getElementById('qty-display');
const totalDisplay = document.getElementById('total-display');
const btnMinus = document.getElementById('btn-minus');
const btnPlus = document.getElementById('btn-plus');
const checkoutForm = document.getElementById('checkout-form');
const loadingOverlay = document.getElementById('loading-overlay');
const statusBanner = document.getElementById('status-banner');

// 1. Contador de Kilos
btnMinus.addEventListener('click', () => {
    if (cantidad > 1) {
        cantidad--;
        actualizarTotal();
    }
});

btnPlus.addEventListener('click', () => {
    cantidad++;
    actualizarTotal();
});

function actualizarTotal() {
    qtyDisplay.textContent = cantidad;
    const total = cantidad * precioUnitario;
    totalDisplay.textContent = total.toLocaleString('es-AR');
}

// 2. Procesar Orden e Iniciar Checkout
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datosPedido = {
        cliente_nombre: document.getElementById('nombre').value.trim(),
        cliente_telefono: document.getElementById('telefono').value.trim(),
        metodo_entrega: document.getElementById('metodo-entrega').value,
        direccion: document.getElementById('direccion').value.trim(),
        cantidad_kg: cantidad
    };

    // Activar spinner por si Render está en "reposo"
    loadingOverlay.classList.remove('hidden');

    try {
        const response = await fetch(`${API_URL}/crear-orden`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPedido)
        });

        const data = await response.json();

        if (response.ok && data.init_point) {
            // Redirigir al cliente a Mercado Pago
            window.location.href = data.init_point;
        } else {
            alert('Error al generar el pago: ' + (data.error || 'Intenta de nuevo.'));
            loadingOverlay.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        alert('No pudimos conectar con el servidor. Por favor, reintenta en unos segundos.');
        loadingOverlay.classList.add('hidden');
    }
});

// 3. Confirmación al volver de Mercado Pago
function verificarRetornoPago() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');

    if (!status) return;

    statusBanner.classList.remove('hidden');

    if (status === 'success') {
        statusBanner.className = 'status-banner success';
        statusBanner.innerHTML = `
            🎉 ¡Pago recibido con éxito! Tu pedido está registrado.<br>
            <a href="https://wa.me/549342XXXXXXX?text=Hola!%20Ya%20realic%C3%A9%20el%20pago%20de%20mi%20pedido%20de%20frutos%20rojos." target="_blank" class="btn-wa">
                📲 Avisar por WhatsApp
            </a>
        `;
    } else if (status === 'pending') {
        statusBanner.className = 'status-banner pending';
        statusBanner.innerHTML = '⏳ Tu pago está pendiente de aprobación. Nos pondremos en contacto cuando se acredite.';
    } else if (status === 'failure') {
        statusBanner.className = 'status-banner failure';
        statusBanner.innerHTML = '❌ El pago fue rechazado. Puedes intentarlo de nuevo.';
    }
}

verificarRetornoPago();
