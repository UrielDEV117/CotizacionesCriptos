// 1. Capturar parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const cryptoId = urlParams.get('id');

if (!cryptoId) {
    window.location.href = 'index.html';
}

const parBitget = `${cryptoId.toUpperCase()}USDT`;

// URL oficial v2 con granularidad de 4 horas ('4h') y límite de 30 velas
const API_HISTORIAL = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${parBitget}&granularity=4h&limit=30`;

let miGrafica;

async function cargarGraficaHistorial() {
    try {
        console.log(`Pidiendo datos de trading para ${parBitget} a Bitget v2...`);
        document.getElementById('grafica-titulo').innerText = `Historial en Vivo de ${cryptoId.toUpperCase()}`;

        const respuesta = await fetch(API_HISTORIAL);
        
        if (!respuesta.ok) {
            throw new Error(`Servidor inaccesible. Código de estado: ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        // Validamos la respuesta nativa de Bitget v2
        if (datos.msg === "success" && datos.data && datos.data.length > 0) {
            
            // Clonamos e invertimos las velas para que el tiempo corra de izquierda a derecha
            const velas = [...datos.data].reverse();

            // Procesamos etiquetas (X) y precios de cierre (Y)
            const etiquetasTiempo = velas.map(vela => {
                const fecha = new Date(parseInt(vela[0]));
                return fecha.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            });

            const preciosCierre = velas.map(vela => parseFloat(vela[4]));

            console.log("Datos procesados con éxito. Dibujando gráfico...");
            renderizarChart(etiquetasTiempo, preciosCierre);

        } else {
            throw new Error("Bitget devolvió un formato vacío o inesperado.");
        }

    } catch (error) {
        console.error("Fallo crítico en grafica.js:", error);
        document.getElementById('grafica-titulo').innerText = `Error al conectar con el historial de ${cryptoId.toUpperCase()}`;
    }
}

function renderizarChart(etiquetas, precios) {
    const canvas = document.getElementById('myChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    if (miGrafica) {
        miGrafica.destroy();
    }

    // Degradado moderno debajo de la línea dorada
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 400);
    gradient.addColorStop(0, 'rgba(255, 193, 7, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 193, 7, 0.0)');

    miGrafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: [{
                label: 'Precio de Cierre (USDT)',
                data: precios,
                borderColor: '#ffc107',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.3,
                pointRadius: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#a0a0a5' }
                },
                y: {
                    beginAtZero: false, // CLAVE: Permite ver variaciones pequeñas con zoom automático
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#a0a0a5',
                        callback: function(value) {
                            // Ajuste dinámico de precisión según el valor de la moneda
                            const precision = value < 0.1 ? 8 : 2;
                            return '$' + value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: precision
                            });
                        }
                    }
                }
            }
        }
    });
}
