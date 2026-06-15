// --- CONFIGURACIÓN ---
const urlParams = new URLSearchParams(window.location.search);
const tickerId = urlParams.get('id') || 'btc';
const titulo = document.getElementById('grafica-titulo');
let myChart;

// Título dinámico
titulo.innerText = `${tickerId.toUpperCase()} / USDT`;

// --- LÓGICA PRINCIPAL ---
async function cargarDatos(ticker, period) {
    const timer = document.getElementById('timer');
    timer.innerText = `Cargando datos de ${ticker.toUpperCase()} (${period})...`;
    
    // AQUÍ: Sustituye la URL por la llamada real a tu API de Bitget
    console.log(`Fetching: ${ticker}, Periodo: ${period}`);

    // Simulación de respuesta de API (Diferentes datos según ticker)
    const base = ticker === 'eth' ? 3000 : 60000;
    const datosSimulados = Array.from({length: 5}, () => Math.floor(base + (Math.random() * 500)));

    // Actualizar gráfica
    myChart.data.datasets[0].data = datosSimulados;
    myChart.update();
    
    timer.innerText = `Datos actualizados para ${ticker.toUpperCase()}`;
}

// Evento de los botones
async function cambiarTimeframe(tf) {
    await cargarDatos(tickerId, tf);
}

// Inicialización
function init() {
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['09:00', '08:00', '07:00', '06:00', '05:00'],
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

    // Carga inicial
    cargarDatos(tickerId, '1h');
}

init();