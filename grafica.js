// 1. Capturar parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const cryptoId = urlParams.get('id');

if (!cryptoId) {
    window.location.href = 'index.html';
}

const parBitget = `${cryptoId.toUpperCase()}USDT`;
// URL v2 correcta
const API_HISTORIAL = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${parBitget}&granularity=4h&limit=30`;

let miGrafica;

async function cargarGraficaHistorial() {
    try {
        document.getElementById('grafica-titulo').innerText = `Cargando datos de ${cryptoId.toUpperCase()}...`;

        const respuesta = await fetch(API_HISTORIAL);
        if (!respuesta.ok) throw new Error("Error en red");

        const json = await respuesta.json();

        // VALIDACIÓN: La API v2 devuelve los datos en json.data
        if (json.code === "00000" && json.data && json.data.length > 0) {
            
            // Invertir para que la fecha más antigua sea la primera (izquierda a derecha)
            const velas = [...json.data].reverse();

            const etiquetasTiempo = velas.map(vela => {
                const fecha = new Date(parseInt(vela[0]));
                return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            });

            const preciosCierre = velas.map(vela => parseFloat(vela[4]));

            document.getElementById('grafica-titulo').innerText = `Historial en Vivo de ${cryptoId.toUpperCase()}`;
            renderizarChart(etiquetasTiempo, preciosCierre);

        } else {
            throw new Error("No hay datos disponibles para este par.");
        }
    } catch (error) {
        console.error(error);
        document.getElementById('grafica-titulo').innerText = `Error: No se pudo cargar el historial`;
    }
}

function renderizarChart(etiquetas, precios) {
    const canvas = document.getElementById('myChart');
    const ctx = canvas.getContext('2d');

    if (miGrafica) miGrafica.destroy();

    miGrafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [{
                label: 'Precio',
                data: precios,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

cargarGraficaHistorial();