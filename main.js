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
    contenedor.innerHTML = ''; 

    listaTickers.forEach((ticker, indice) => {
        const parSymbol = ticker.symbol; 
        const simbolo = parSymbol.replace('USDT', '');
        const precioUSD = parseFloat(ticker.lastPr);
        const precioApertura = parseFloat(ticker.open);
        
        let formatoPrecio = { minimumFractionDigits: 2, maximumFractionDigits: 4 };
        if (precioUSD < 0.1) formatoPrecio = { minimumFractionDigits: 4, maximumFractionDigits: 8 };

        let cambio24h = (precioApertura > 0) ? ((precioUSD - precioApertura) / precioApertura) * 100 : 0;
        const cambioRedondeado = parseFloat(cambio24h.toFixed(2));
        
        let claseCambio = cambioRedondeado > 0 ? 'positivo' : (cambioRedondeado < 0 ? 'negativo' : 'neutro');
        let signo = cambioRedondeado > 0 ? '+' : '';

        const tarjetaHTML = `
            <a href="grafica.html?id=${simbolo.toLowerCase()}" class="card-link">
                <div class="card">
                    <div class="card-header">
                        <span class="ranking">#${indice + 1}</span>
                        <h2>${simbolo} <span class="simbolo">(USDT)</span></h2>
                    </div>
                    <p class="precio">$${precioUSD.toLocaleString('en-US', formatoPrecio)}</p>
                    <span class="cambio ${claseCambio}">${signo}${cambioRedondeado.toFixed(2)}%</span>
                </div>
            </a>
        `;
        contenedor.innerHTML += tarjetaHTML;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    consultarAPI();
    setInterval(consultarAPI, 30000);
});