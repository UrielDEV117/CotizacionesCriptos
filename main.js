console.log("Conectado");
// URL oficial v2 de Bitget Spot
const API_URL = 'https://api.bitget.com/api/v2/spot/market/tickers';

// Lista de monedas a monitorear (MANTENIDA)
const TOP_CRIPTOS = [
    'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'TRX', 'DOT',
    'LINK', 'MATIC', 'LTC', 'UNI', 'NEAR', 'APT', 'ARB', 'OP', 'ATOM', 'FIL',
    'LDO', 'ETC', 'XLM', 'HBAR', 'GRT', 'MKR', 'AAVE', 'INJ', 'RNDR', 'THETA',
    'FTM', 'ALGO', 'FLOW', 'ICP', 'VET', 'SAND', 'MANA', 'EGLD', 'AXS', 'BGB',
    'PEPE', 'WIF', 'FLOKI', 'BONK', 'SHIB',
    'STX', 'IMX', 'BEAM', 'GALA', 'APE',
    'FET', 'AGIX', 'OCEAN', 'AKT', 'WLD',
    'TIA', 'SUI', 'SEI', 'MINA', 'KAS',
    'OP', 'METIS', 'MANTA', 'STRK', 'ZK',
    'PENDLE', 'ENA', 'JUP', 'RAY', 'CRV',
    'ONDO', 'OM', 'RSR', 'TRU', 'AVAX',
    'IMX', 'FLOW', 'ENJ', 'CHZ', 'SUPER',
    'XMR', 'ZEC', 'DASH', 'LRC', 'ENS',
    'VTHO', 'ONE', 'ANKR', 'QTUM', 'BAT'
];

async function consultarAPI() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);

        const datos = await respuesta.json();
        
        if (datos.code === "00000" && datos.data) {
            // Filtrado manteniendo el orden de TOP_CRIPTOS
            const datosFiltrados = datos.data
                .filter(ticker => ticker.symbol.endsWith('USDT'))
                .map(ticker => ({
                    ...ticker,
                    base: ticker.symbol.replace('USDT', '')
                }))
                .filter(ticker => TOP_CRIPTOS.includes(ticker.base))
                .sort((a, b) => TOP_CRIPTOS.indexOf(a.base) - TOP_CRIPTOS.indexOf(b.base));

            renderizarTarjetas(datosFiltrados);
        }
    } catch (error) {
        console.error("Hubo un fallo al sincronizar con Bitget:", error);
    }
}

function renderizarTarjetas(lista) {
    const contenedor = document.getElementById('crypto-container');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    lista.forEach((ticker, index) => {
        const precioNum = parseFloat(ticker.lastPr || 0);
        const cambioNum = parseFloat(ticker.chg24h || 0);
        
        // Lógica de precisión: Si el precio es < 1, muestra 6 decimales, si no, 2.
        const precioFormateado = precioNum < 1 ? precioNum.toFixed(6) : precioNum.toFixed(2);
        const cambioFormateado = cambioNum.toFixed(2);
        
        const esPositivo = cambioNum >= 0;
        const colorClase = esPositivo ? 'positivo' : 'negativo';

        const tarjeta = document.createElement('div');
        tarjeta.className = 'card';
        tarjeta.innerHTML = `
            <span class="ranking">#${index + 1}</span>
            <h3>${ticker.base} (USDT)</h3>
            <p class="precio">$${precioFormateado}</p>
            <p class="${colorClase}">${esPositivo ? '+' : ''}${cambioFormateado}%</p>
            <button class="btn-grafica" onclick="window.location.href='grafica.html?id=${ticker.base.toLowerCase()}'">
                Ver Gráfica
            </button>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// Inicialización
consultarAPI();
setInterval(consultarAPI, 10000); // Actualiza cada 10 segundos