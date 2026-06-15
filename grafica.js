const urlParams = new URLSearchParams(window.location.search);
const tickerId = urlParams.get('id') || 'btc';
let myChart;

// Título dinámico
const titulo = document.getElementById('titulo-grafica'); // Asegúrate que en HTML el ID sea este
if (titulo) titulo.innerText = `${tickerId.toUpperCase()} / USDT`;

// Mapeo de botones a los valores de la API de Bitget
const timeframes = {
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1D'
};

async function cargarDatos(ticker, period = '1h') {
    const timer = document.getElementById('timer');
    const infoZona = document.getElementById('zona-horaria-info');
    const periodValue = timeframes[period] || '1h';
    
    if (timer) timer.innerText = `Cargando velas de ${periodValue}...`;
    if (infoZona) {
        infoZona.innerText = `Tu hora local: ${Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}`;
    }
    
    try {
        // Llamada a la API de velas reales de Bitget
        const url = `https://api.bitget.com/api/v2/spot/market/history-candles?symbol=${ticker.toUpperCase()}USDT&granularity=${periodValue}`;
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.data && json.data.length > 0) {
            // Bitget retorna: [timestamp, open, high, low, close, vol, quoteVol]
            // Tomamos las últimas 10 velas y las invertimos para que la más reciente esté a la derecha
            const velas = json.data.slice(0, 10).reverse(); 
            const precios = velas.map(v => parseFloat(v[4])); 
            const labels = velas.map(v => new Date(parseInt(v[0])).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

            if (myChart) {
                myChart.data.labels = labels;
                myChart.data.datasets[0].data = precios;
                myChart.update();
            }
            
            if (timer) timer.innerText = `Precio actual: $${precios[precios.length - 1].toLocaleString()}`;
        }
    } catch (e) {
        console.error("Error al cargar velas:", e);
        if (timer) timer.innerText = "Error al conectar con Bitget";
    }
}

// Función global para los botones
window.cambiarTimeframe = async function(tf) {
    await cargarDatos(tickerId, tf);
};

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
                y: { ticks: { color: '#ffffff' }, grid: { color: '#333' } },
                x: { ticks: { color: '#ffffff' }, grid: { display: false } }
            }
        }
    });
    cargarDatos(tickerId, '1h');
}

init();