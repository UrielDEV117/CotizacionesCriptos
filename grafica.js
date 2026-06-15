const urlParams = new URLSearchParams(window.location.search);
const tickerId = urlParams.get('id') || 'btc';
let myChart;

// Título dinámico
const titulo = document.getElementById('titulo-grafica');
if (titulo) titulo.innerText = `${tickerId.toUpperCase()} / USDT`;

// Mapeo exacto según el requerimiento de la API V2 de Bitget
const timeframes = {
    '15m': '15min',
    '1h': '1H',
    '4h': '4H',
    '1d': '1day'
};

async function cargarDatos(ticker, period = '1h') {
    const timer = document.getElementById('timer');
    const periodValue = timeframes[period] || '1H';
    const symbol = `${ticker.toUpperCase()}USDT`;
    
    if (timer) timer.innerText = `Cargando velas de ${periodValue}...`;
    
    try {
        // Endpoint V2 corregido y validado
        const url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}&granularity=${periodValue}&limit=10`;
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || `HTTP ${response.status}`);
        }
        
        const json = await response.json();
        
        if (json.data && json.data.length > 0) {
            // Los datos vienen en orden inverso (más reciente al final), revertimos para la gráfica
            const velas = json.data.reverse(); 
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
        console.error("Error en la petición:", e);
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