console.log("Conectado")
// URL oficial v2 de Bitget Spot
const API_URL = 'https://api.bitget.com/api/v2/spot/market/tickers';

// Lista de monedas a monitorear
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
        console.log("Actualizando precios en tiempo real desde Bitget Exchange...");
        const respuesta = await fetch(API_URL);
        
        if (!respuesta.ok) {
            throw new Error(`Error de conexión con Bitget: Código ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        
        // La API v2 suele envolver los datos en un objeto 'data'
        if (datos.code === "00000" && datos.data) {
            
            const datosFiltrados = datos.data.filter(ticker => {
                const par = ticker.symbol;
                if (!par.endsWith('USDT')) return false;
                const monedaBase = par.replace('USDT', '');
                return TOP_CRIPTOS.includes(monedaBase);
            });

            datosFiltrados.sort((a, b) => {
                const tokenA = a.symbol.replace('USDT', '');
                const tokenB = b.symbol.replace('USDT', '');
                return TOP_CRIPTOS.indexOf(tokenA) - TOP_CRIPTOS.indexOf(tokenB);
            });

            renderizarTarjetas(datosFiltrados);
        }
    } catch (error) {
        console.error("Hubo un fallo al sincronizar con Bitget:", error);
    }
}

function renderizarTarjetas(listaTickers) {
    const contenedor = document.getElementById('crypto-container');
    if (!contenedor) return;
    
    // Limpiamos antes de inyectar
    contenedor.innerHTML = ''; 

    listaTickers.forEach((ticker, index) => {
        const simbolo = ticker.symbol.replace('USDT', '');
        const precio = parseFloat(ticker.lastPr).toFixed(2);
        const cambio = parseFloat(ticker.chg24h).toFixed(2);
        const esPositivo = cambio >= 0;
        const claseCambio = esPositivo ? 'positivo' : 'negativo';
        const signo = esPositivo ? '+' : '';

        // Creamos el elemento de la tarjeta
        const tarjeta = document.createElement('div');
        tarjeta.className = 'card'; // Esta clase debe estar en tu CSS
        
        // Inyectamos el HTML con las clases de diseño
        tarjeta.innerHTML = `
            <div class="card-header">
                <span class="ranking">#${index + 1}</span>
                <h3>${simbolo} (USDT)</h3>
            </div>
            <p class="precio">$${precio}</p>
            <p class="cambio ${claseCambio}">${signo}${cambio}%</p>
            <button class="btn-grafica" onclick="window.location.href='grafica.html?id=${simbolo.toLowerCase()}'">
                Ver Gráfica
            </button>
        `;
        
        contenedor.appendChild(tarjeta);
    });
}

// Asegúrate de seguir llamando a consultarAPI() cada cierto tiempo
setInterval(consultarAPI, 5000);
consultarAPI();