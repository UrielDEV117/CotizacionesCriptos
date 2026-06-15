const urlParams = new URLSearchParams(window.location.search);
const tickerId = urlParams.get('id') || 'btc';
let myChart;

const titulo = document.getElementById('titulo-grafica');
if (titulo) titulo.innerText = `${tickerId.toUpperCase()} / USDT`;

// Mapeo técnico exacto requerido por la API V2
const timeframes = {
    '15m': '15min',
    '1h': '1H',
    '4h': '4H',
    '1d': '1day'
};

async function cargarDatos(ticker, period = '15m') {
    const timer = document.getElementById('timer');
    // Usamos el mapeo técnico, si falla, cae a '15min' por seguridad
    const periodValue = timeframes[period] || '15min';
    const symbol = `${ticker.toUpperCase()}USDT`;
    
    if (timer) timer.innerText = `Cargando ${period}...`;
    
    try {
        const url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}&granularity=${periodValue}&limit=10`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const json = await response.json();
        
        if (json.code === "00000" && json.data) {
            const velas = json.data.reverse(); 
            const precios = velas.map(v => parseFloat(v[4])); 
            
            // CORRECCIÓN AM/PM: Fuerza formato 12h y fuerza nomenclatura en inglés
            const labels = velas.map(v => {
                const date = new Date(parseInt(v[0]));
                return period === '1d' 
                    ? date.toLocaleDateString() 
                    : date.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        hour12: true 
                    });
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
        if (timer) timer.innerText = "Error al conectar con Bitget";
    }
}

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

    // Carga inicial forzada a 15min para evitar el error 400
    setTimeout(() => {
        cargarDatos(tickerId, '15m');
    }, 1000);
}

init();