console.log("Conectado")

//api conexion 
// URL oficial v2 de Bitget Spot
const API_URL = 'https://api.bitget.com/api/v2/spot/market/tickers';

// Lista ampliada con 50 monedas adicionales (Top 90 del mercado cripto)
const TOP_CRIPTOS = [
    'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'TRX', 'DOT',
    'LINK', 'MATIC', 'LTC', 'UNI', 'NEAR', 'APT', 'ARB', 'OP', 'ATOM', 'FIL',
    'LDO', 'ETC', 'XLM', 'HBAR', 'GRT', 'MKR', 'AAVE', 'INJ', 'RNDR', 'THETA',
    'FTM', 'ALGO', 'FLOW', 'ICP', 'VET', 'SAND', 'MANA', 'EGLD', 'AXS', 'BGB',
    // --- 50 NUEVAS MONEDAS AGREGADAS ---
    'PEPE', 'WIF', 'FLOKI', 'BONK', 'SHIB',     // Memecoins con altísimo volumen
    'STX', 'IMX', 'BEAM', 'GALA', 'APE',        // Gaming y capas de Bitcoin
    'FET', 'AGIX', 'OCEAN', 'AKT', 'WLD',       // Inteligencia Artificial (IA)
    'TIA', 'SUI', 'SEI', 'MINA', 'KAS',         // Nuevas Capas 1 (L1) de alta velocidad
    'OP', 'METIS', 'MANTA', 'STRK', 'ZK',       // Capas 2 (L2) e infraestructura Rollup
    'PENDLE', 'ENA', 'JUP', 'RAY', 'CRV',       // DeFi avanzado, agregadores y Yield
    'ONDO', 'OM', 'RSR', 'TRU', 'AVAX',         // Real World Assets (RWA) / Tokenización
    'IMX', 'FLOW', 'ENJ', 'CHZ', 'SUPER',       // NFTs, metaverso y Fan Tokens
    'XMR', 'ZEC', 'DASH', 'LRC', 'ENS',         // Privacidad e infraestructura web3
    'VTHO', 'ONE', 'ANKR', 'QTUM', 'BAT'        // Monedas históricas de utilidad
];

async function consultarAPI() {
    try {
        console.log("Actualizando precios en tiempo real desde Bitget Exchange...");
        const respuesta = await fetch(API_URL);
        
        if (!respuesta.ok) {
            throw new Error(`Error de conexión con Bitget: Código ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        
        if (datos.msg === "success" && datos.data) {
            
            // Filtramos la respuesta para quedarnos solo con nuestro TOP ampliado
            const datosFiltrados = datos.data.filter(ticker => {
                const par = ticker.symbol;
                if (!par.endsWith('USDT')) return false;
                const monedaBase = par.replace('USDT', '');
                return TOP_CRIPTOS.includes(monedaBase);
            });

            // Ordenamos las tarjetas según nuestra lista TOP_CRIPTOS
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
        const nombre = simbolo;

        // Pasamos los precios a números
        const precioUSD = parseFloat(ticker.lastPr);
        const precioApertura = parseFloat(ticker.open);
        
        // Lógica de formato dinámico: si el precio es < 0.1, mostramos más precisión
        let formatoPrecio = { minimumFractionDigits: 2, maximumFractionDigits: 4 };
        if (precioUSD < 0.1) {
            formatoPrecio = { minimumFractionDigits: 4, maximumFractionDigits: 8 };
        }

        // CÁLCULO MATEMÁTICO: Porcentaje real
        let cambio24h = 0;
        if (precioApertura && precioApertura > 0) {
            cambio24h = ((precioUSD - precioApertura) / precioApertura) * 100;
        }

        const cambioRedondeado = parseFloat(cambio24h.toFixed(2));
        const volumen24h = parseFloat(ticker.usdtVolume);

        // DETERMINACIÓN DE CLASES CSS
        let claseCambio = 'neutro';
        let signo = '';

        if (cambioRedondeado > 0) {
            claseCambio = 'positivo';
            signo = '+';
        } else if (cambioRedondeado < 0) {
            claseCambio = 'negativo';
            signo = ''; 
        } else {
            claseCambio = 'neutro';
            signo = '';
        }

        const idParaGrafica = simbolo.toLowerCase(); 
        const inicialMoneda = simbolo.charAt(0);

        const tarjetaHTML = `
            <a href="grafica.html?id=${idParaGrafica}" class="card-link">
                <div class="card">
                    <div class="card-header">
                        <span class="ranking">#${indice + 1}</span>
                        <div class="crypto-logo-placeholder">
                            ${inicialMoneda}
                        </div>
                        <h2>${nombre} <span class="simbolo">(USDT)</span></h2>
                    </div>
                    
                    <p class="precio">$${precioUSD.toLocaleString('en-US', formatoPrecio)}</p>
                    
                    <span class="cambio ${claseCambio}">
                        ${signo}${cambioRedondeado.toFixed(2)}%
                    </span>
                    
                    <div class="info-extra">
                        <div class="dato-bloque">
                            <span class="etiqueta">Max 24h:</span>
                            <span class="valor">$${parseFloat(ticker.high24h).toLocaleString('en-US', formatoPrecio)}</span>
                        </div>
                        <div class="dato-bloque">
                            <span class="etiqueta">Volumen 24h:</span>
                            <span class="valor">$${Math.round(volumen24h).toLocaleString('en-US')}</span>
                        </div>
                    </div>
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