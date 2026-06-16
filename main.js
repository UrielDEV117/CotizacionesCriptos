console.log("Conectado a Bitget API v2");

// main.js - Estructura corregida para lectura de volumen
const API_URL = 'https://api.bitget.com/api/v2/spot/market/tickers';

const TOP_CRIPTOS = [
    'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'TRX', 'DOT',
    'UNI', 'AAVE', 'MKR', 'COMP', 'CRV', 'SUSHI', 'DYDX', 'LDO', 'GMX', 'PENDLE', 'ENA',
    'FET', 'WLD', 'RNDR', 'NEAR', 'GRT', 'OCEAN',
    'PEPE', 'WIF', 'FLOKI', 'BONK', 'SHIB',
    'IMX', 'BEAM', 'GALA', 'SAND', 'MANA', 'AXS', 'ENJ',
    'SUI', 'SEI', 'TIA', 'STRK', 'ARB', 'OP', 'POL', 'KAS', 'LUMIA'
];

async function consultarAPI() {
    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();
        
        if (datos.code === "00000" && datos.data) {
            const listaFiltrada = datos.data
                .filter(t => t.symbol.endsWith('USDT'))
                .map(t => ({ ...t, base: t.symbol.replace('USDT', '') }))
                .filter(t => TOP_CRIPTOS.includes(t.base))
                .sort((a, b) => TOP_CRIPTOS.indexOf(a.base) - TOP_CRIPTOS.indexOf(b.base));

            renderizarTarjetas(listaFiltrada);
        }
    } catch (error) {
        console.error("Error al sincronizar:", error);
    }
}

function renderizarTarjetas(lista) {
    const contenedor = document.getElementById('crypto-container');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    lista.forEach((ticker, index) => {
        const precioActual = parseFloat(ticker.lastPr || 0);
        const precioApertura = parseFloat(ticker.open || 0);
        
        // CORRECCIÓN: Usamos 'quoteVolume' que es el campo correcto según tu consola
        const volumen = parseFloat(ticker.quoteVolume || 0);
        
        // Cálculo del porcentaje
        let cambio = 0;
        if (precioApertura > 0) {
            cambio = ((precioActual - precioApertura) / precioApertura) * 100;
        }
        if (!isFinite(cambio) || isNaN(cambio)) cambio = 0;

        const precio = precioActual < 1 ? precioActual.toFixed(8) : precioActual.toFixed(2);
        const esPositivo = cambio >= 0;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <span class="ranking">#${index + 1}</span>
            <h3>${ticker.base} (USDT)</h3>
            <p class="precio">$${precio}</p>
            <p class="${esPositivo ? 'positivo' : 'negativo'}">${esPositivo ? '+' : ''}${cambio.toFixed(2)}%</p>
            <p style="font-size: 0.75rem; color: #888; margin-top: 5px;">
                Vol 24h: ${volumen > 0 ? volumen.toLocaleString(undefined, {maximumFractionDigits: 0}) : '0'}
            </p>
            <button class="btn-grafica" onclick="window.location.href='grafica.html?id=${ticker.base.toLowerCase()}'">
                Ver Gráfica
            </button>
        `;
        contenedor.appendChild(card);
    });
}
// Iniciar
consultarAPI();
setInterval(consultarAPI, 10000);