const urlParams = new URLSearchParams(window.location.search);
const cryptoId = urlParams.get('id') || 'btc';
const parBitget = `${cryptoId.toUpperCase()}USDT`;

let miGrafica;
let timeframeActual = '4h';
let intervaloCuentaAtras;

async function cargarGraficaHistorial() {
    // 1. Limpiar el temporizador antes de cargar nuevos datos
    if (intervaloCuentaAtras) clearInterval(intervaloCuentaAtras);
    
    const API_HISTORIAL = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${parBitget}&granularity=${timeframeActual}&limit=30`;
    
    try {
        const respuesta = await fetch(API_HISTORIAL);
        const json = await respuesta.json();

        if (json.code === "00000" && json.data) {
            const velas = [...json.data].reverse();
            const etiquetas = velas.map(v => new Date(parseInt(v[0])).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            const precios = velas.map(v => parseFloat(v[4]));

            renderizarChart(etiquetas, precios);
            
            // 2. Iniciar el nuevo temporizador con el timeframe seleccionado
            iniciarCuentaAtras(timeframeActual);
        }
    } catch (error) {
        console.error("Error al cargar gráfica:", error);
    }
}

// Esta función es la que activan los botones
function cambiarTimeframe(nuevoTF) {
    timeframeActual = nuevoTF;
    // Forzamos la actualización de la UI
    document.getElementById('timer').innerText = "Cargando nuevo intervalo...";
    cargarGraficaHistorial(); 
}

function iniciarCuentaAtras(granularity) {
    const ms = { '15m': 900000, '1h': 3600000, '4h': 14400000, '1d': 86400000 }[granularity] || 14400000;
    
    intervaloCuentaAtras = setInterval(() => {
        const resto = ms - (Date.now() % ms);
        const m = Math.floor((resto / 60000) % 60);
        const s = Math.floor((resto / 1000) % 60);
        
        const timer = document.getElementById('timer');
        if (timer) timer.innerText = `Próxima vela en: ${m}m ${s}s`;
    }, 1000);
}

function renderizarChart(etiquetas, precios) {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (miGrafica) miGrafica.destroy();
    
    miGrafica = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: etiquetas, 
            datasets: [{ 
                data: precios, 
                borderColor: '#ffc107', 
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                fill: true, 
                tension: 0.3 
            }] 
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

cargarGraficaHistorial();