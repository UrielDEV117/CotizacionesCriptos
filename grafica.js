const urlParams = new URLSearchParams(window.location.search);
const tickerId = urlParams.get('id') || 'btc';
let myChart;

// Título dinámico
const titulo = document.getElementById('grafica-titulo');
if (titulo) titulo.innerText = `${tickerId.toUpperCase()} / USDT`;

async function cargarDatos(ticker, period = '1h') {
    const timer = document.getElementById('timer');
    const infoZona = document.getElementById('zona-horaria-info');
    
    if (timer) timer.innerText = `Cargando datos de ${ticker.toUpperCase()}...`;
    
    // Solo intentar acceder a infoZona si existe
    if (infoZona) {
        infoZona.innerText = `Tu hora local: ${Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}`;
    }
    
    try {
        const response = await fetch('https://api.bitget.com/api/v2/spot/market/tickers');
        const data = await response.json();
        const tickerData = data.data.find(t => t.symbol === `${ticker.toUpperCase()}USDT`);
        const precio = tickerData ? parseFloat(tickerData.lastPr) : 100;

        const vol = precio * 0.005;
        if (myChart) {
            myChart.data.datasets[0].data = Array.from({length: 5}, () => precio + (Math.random() * vol * 2 - vol));
            myChart.update();
        }
        
        if (timer) timer.innerText = `Precio actual: $${precio.toLocaleString()}`;
    } catch (e) {
        if (timer) timer.innerText = "Error al cargar datos";
    }
}

// Hacemos la función global para que el HTML la encuentre
window.cambiarTimeframe = async function(tf) {
    console.log("Cambiando timeframe a:", tf);
    await cargarDatos(tickerId, tf);
};

function init() {
    const ctx = document.getElementById('myChart');
    if (!ctx) return;
    
    myChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({length: 5}, (_, i) => {
                const d = new Date();
                d.setHours(d.getHours() - (4 - i));
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }),
            datasets: [{
                label: 'Precio',
                data: [0, 0, 0, 0, 0],
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
    cargarDatos(tickerId);
}

// Inicializar
init();