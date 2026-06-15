const urlParams = new URLSearchParams(window.location.search);
let tickerId = urlParams.get('id') || 'btc';

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
    
    if (titulo) {
        titulo.innerText = `${ticker.toUpperCase()} / USDT`;
        titulo.style.color = "#f0b90b";
    }
    
    try {
        const url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}&granularity=${periodValue}&limit=15`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const json = await response.json();
        
        if (json.code === "00000" && json.data) {
            const velas = json.data.reverse(); 
            const precios = velas.map(v => parseFloat(v[4])); 
            
            // Formateo de etiquetas estilo TradingView
            const labels = velas.map(v => {
                const date = new Date(parseInt(v[0]));
                if (period === '1d') {
                    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                }
                return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
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

function mostrarInfoLocalizacion() {
    if (infoLocalizacion) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        infoLocalizacion.innerText = `Zona horaria: ${timezone}`;
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
                backgroundColor: 'rgba(240, 185, 11, 0.05)',
                fill: true,
                tension: 0.3,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { bottom: 10 } },
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    ticks: { color: '#b2b5be', font: { size: 11 } },
                    grid: { color: '#2d2e36' } 
                },
                x: { 
                    ticks: { 
                        color: '#b2b5be', 
                        font: { size: 11 },
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 6
                    },
                    grid: { display: false }
                }
            }
        }
    });

    mostrarInfoLocalizacion();
    setTimeout(() => {
        cargarDatos(tickerId, '15m');
        iniciarAutoRefresh('15m');
    }, 1000);
}

init();