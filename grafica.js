const urlParams = new URLSearchParams(window.location.search);
let tickerId = urlParams.get('id') || 'btc';
let myChart;
let refreshInterval;

const timeframes = { '15m': '15min', '1h': '1h', '4h': '4h', '1d': '1day' };

function configurarInfo() {
    document.getElementById('titulo-par').innerText = `${tickerId.toUpperCase()}/USDT`;
    document.getElementById('info-localizacion').innerText = `Zona horaria: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
}

window.cambiarTimeframe = async function(tf) {
    clearInterval(refreshInterval);
    // Visual: Indicador de carga
    document.getElementById('cargando-grafica').style.display = 'block';
    
    myChart.data.labels = [];
    myChart.data.datasets[0].data = [];
    myChart.update('none');
    
    await cargarDatos(tickerId, tf);
    iniciarAutoRefresh(tf);
};

async function cargarDatos(ticker, period = '15m') {
    const periodValue = timeframes[period] || '15min';
    // Timestamp para evitar caché del navegador
    const url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${ticker.toUpperCase()}USDT&granularity=${periodValue}&limit=50&t=${Date.now()}`;
    
    try {
        const response = await fetch(url);
        const json = await response.json();
        
        if (json && json.code === "00000" && Array.isArray(json.data)) {
            const velas = json.data.reverse(); 
            const precios = velas.map(v => parseFloat(v[4]));
            
            // Cálculo de variación porcentual
            const precioInicio = precios[0];
            const precioActual = precios[precios.length - 1];
            const variacion = ((precioActual - precioInicio) / precioInicio) * 100;
            const color = variacion >= 0 ? '#0ecb81' : '#f6465d';
            
            // Inyectar variación con efecto de opacidad para notar el refresco
            const infoPrecios = document.getElementById('info-precios');
            infoPrecios.innerHTML = `<span style="color:${color};">${variacion >= 0 ? '+' : ''}${variacion.toFixed(2)}%</span>`;
            infoPrecios.style.opacity = 0.5;
            setTimeout(() => infoPrecios.style.opacity = 1, 200);

            // Actualizar Gráfica
            myChart.data.labels = velas.map(v => {
                const d = new Date(parseInt(v[0]));
                return period === '1d' 
                    ? d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) 
                    : d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            });
            
            myChart.data.datasets[0].data = precios;
            myChart.update();
            
            // Finalizar carga y actualizar timer con segundos
            document.getElementById('cargando-grafica').style.display = 'none';
            document.getElementById('timer').innerText = `Actualizado: ${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}`;
        }
    } catch (e) { console.error("Error de conexión"); }
}

function iniciarAutoRefresh(period) {
    refreshInterval = setInterval(() => cargarDatos(tickerId, period), 30000);
}

function init() {
    configurarInfo();
    const ctx = document.getElementById('myChart');
    if (!ctx) return;
    
    myChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Precio', data: [], borderColor: '#f0b90b', fill: true, tension: 0.2 }] },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 6 } } }
        }
    });

    cargarDatos(tickerId, '15m');
    iniciarAutoRefresh('15m');
}

document.addEventListener('DOMContentLoaded', init);