const urlParams = new URLSearchParams(window.location.search);
const cryptoId = urlParams.get('id');
const parBitget = `${cryptoId.toUpperCase()}USDT`;

let miGrafica;
let timeframeActual = '4h';
let intervaloCuentaAtras;

// Función principal de carga
async function cargarGraficaHistorial() {
    const API_HISTORIAL = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${parBitget}&granularity=${timeframeActual}&limit=30`;
    
    try {
        const respuesta = await fetch(API_HISTORIAL);
        const json = await respuesta.json();

        if (json.code === "00000" && json.data) {
            const velas = [...json.data].reverse();
            const etiquetas = velas.map(v => new Date(parseInt(v[0])).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            const precios = velas.map(v => parseFloat(v[4]));

            renderizarChart(etiquetas, precios);
            iniciarCuentaAtras(timeframeActual); // Inicia el reloj al cargar datos
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Lógica de cambio de timeframe
function cambiarTimeframe(nuevoTF) {
    timeframeActual = nuevoTF;
    cargarGraficaHistorial();
}

// Lógica de cuenta atrás
function iniciarCuentaAtras(granularity) {
    if (intervaloCuentaAtras) clearInterval(intervaloCuentaAtras);

    const ms = convertirTFAMilisegundos(granularity);
    
    intervaloCuentaAtras = setInterval(() => {
        const ahora = Date.now();
        const resto = ms - (ahora % ms);
        
        const min = Math.floor((resto / 1000 / 60) % 60);
        const seg = Math.floor((resto / 1000) % 60);

        document.getElementById('timer').innerText = `Próxima vela en: ${min}m ${seg}s`;
    }, 1000);
}

function convertirTFAMilisegundos(tf) {
    const map = { '15m': 15*60*1000, '1h': 60*60*1000, '4h': 4*60*60*1000, '1d': 24*60*60*1000 };
    return map[tf] || 4*60*60*1000;
}

function renderizarChart(etiquetas, precios) {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (miGrafica) miGrafica.destroy();

    miGrafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [{
                label: 'Precio',
                data: precios,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

cargarGraficaHistorial();