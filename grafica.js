const urlParams = new URLSearchParams(window.location.search);
const cryptoId = urlParams.get('id') || 'btc';
const parBitget = `${cryptoId.toUpperCase()}USDT`;

let miGrafica;
let timeframeActual = '4h';
let intervaloCuentaAtras;

async function cargarGraficaHistorial() {
    // 1. Limpiar cualquier proceso anterior
    if (intervaloCuentaAtras) clearInterval(intervaloCuentaAtras);
    
    // 2. Mapeo exacto según los valores permitidos por la API (error 400171)
    const mapGranularity = { 
        '15m': '15min', 
        '1h': '1h', 
        '4h': '4h', 
        '1d': '1day' 
    };
    
    const granularityValue = mapGranularity[timeframeActual];

    // 3. Petición a la API
    const API_HISTORIAL = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${parBitget}&granularity=${granularityValue}&limit=30`;
    
    try {
        const respuesta = await fetch(API_HISTORIAL);
        const json = await respuesta.json();

        // 4. Verificación de éxito de la API
        if (json.code === "00000" && json.data) {
            const velas = [...json.data].reverse();
            const etiquetas = velas.map(v => new Date(parseInt(v[0])).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            const precios = velas.map(v => parseFloat(v[4]));

            renderizarChart(etiquetas, precios);
            iniciarCuentaAtras(timeframeActual);
        } else {
            console.error("Error en respuesta de API:", json);
            const titulo = document.getElementById('grafica-titulo');
            if (titulo) titulo.innerText = "Error cargando datos";
        }
    } catch (error) {
        console.error("Error al conectar:", error);
    }
}

// Función que activan los botones
function cambiarTimeframe(nuevoTF) {
    timeframeActual = nuevoTF;
    const timer = document.getElementById('timer');
    if (timer) timer.innerText = "Cargando nuevo intervalo...";
    cargarGraficaHistorial(); 
}

// Lógica de cuenta atrás
function iniciarCuentaAtras(granularity) {
    const mapMs = { '15m': 900000, '1h': 3600000, '4h': 14400000, '1d': 86400000 };
    const ms = mapMs[granularity] || 14400000;
    
    intervaloCuentaAtras = setInterval(() => {
        const resto = ms - (Date.now() % ms);
        const m = Math.floor((resto / 60000) % 60);
        const s = Math.floor((resto / 1000) % 60);
        
        const timer = document.getElementById('timer');
        if (timer) timer.innerText = `Próxima vela en: ${m}m ${s}s`;
    }, 1000);
}

function renderizarChart(etiquetas, precios) {
    const canvas = document.getElementById('myChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
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
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } } 
        }
    });
}

// Carga inicial
cargarGraficaHistorial();