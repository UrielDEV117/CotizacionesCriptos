const urlParams = new URLSearchParams(window.location.search);
let tickerId = urlParams.get('id') || 'btc';

// Referencia a elementos del HTML
const titulo = document.getElementById('grafica-titulo'); 
const infoLocalizacion = document.getElementById('info-localizacion');

let myChart;
let refreshInterval;

const timeframes = {
    '15m': '15min',
    '1h': '1h',
    '4h': '4h',
    '1d': '1day'
};

async function cargarDatos(ticker, period = '15m') {
    const timer = document.getElementById('timer');
    const periodValue = timeframes[period] || '15min';
    const symbol = `${ticker.toUpperCase()}USDT`;
    
    // Actualizar título
    if (titulo) {
        titulo.innerText = `${ticker.toUpperCase()} / USDT`;
        titulo.style.color = "#f0b90b";
    }
    
    try {
        const url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}&granularity=${periodValue}&limit=10`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const json = await response.json();
        
        if (json.code === "00000" && json.data) {
            const velas = json.data.reverse(); 
            const precios = velas.map(v => parseFloat(v[4])); 
            
            const labels = velas.map(v => {
                const date = new Date(parseInt(v[0]));
                if (period === '1d') {
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                }
                return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
            });

            if (myChart) {
                myChart.data.labels = labels;
                myChart.data.datasets[0].data = precios;
                myChart.update();
            }
            if (timer) timer.innerText = `Precio actual: $${precios[precios.length - 1].toLocaleString()}`;
        }
    } catch (e) {
        console.error("Error:", e);
        if (titulo) titulo.innerText = "Error al conectar";
    }
}

// Función para mostrar zona horaria
function mostrarInfoLocalizacion() {
    if (infoLocalizacion) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        infoLocalizacion.innerText = `Zona horaria detectada: ${timezone}`;
    }
}

window.cambiarTimeframe = async function(tf) {
    clearInterval(refreshInterval);
    await cargarDatos(tickerId, tf);
    iniciarAutoRefresh(tf);
};

function iniciarAutoRefresh(period) {
    refreshInterval = setInterval(() => {
        cargarDatos(tickerId, period);
    }, 30000);
}

function init() {
    const ctx = document.getElementById('myChart');
    if (!ctx) return;
    
    myChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Precio',
                data: [],
                borderColor: '#f0b90b',
                backgroundColor: 'rgba(240, 185, 11, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { color: '#ffffff' } },
                x: { 
                    ticks: { 
                        color: '#ffffff', 
                        maxRotation: 0, 
                        minRotation: 0,
                        maxTicksLimit: 8
                    } 
                }
            }
        }
    });

    mostrarInfoLocalizacion(); // Ejecuta la detección de zona horaria
    setTimeout(() => {
        cargarDatos(tickerId, '15m');
        iniciarAutoRefresh('15m');
    }, 1000);
}

init();