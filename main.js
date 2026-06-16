console.log("Conectado a Bitget API v2");

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
    const statusEl = document.getElementById('status-message');
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("Servidor no responde");
        
        const datos = await respuesta.json();
        
        if (datos.code === "00000" && datos.data) {
            statusEl.style.display = 'none';
            const listaFiltrada = datos.data
                .filter(t => t.symbol.endsWith('USDT'))
                .map(t => ({ ...t, base: t.symbol.replace('USDT', '') }))
                .filter(t => TOP_CRIPTOS.includes(t.base))
                .sort((a, b) => TOP_CRIPTOS.indexOf(a.base) - TOP_CRIPTOS.indexOf(b.base));

            renderizarTarjetas(listaFiltrada);
        }
    } catch (error) {
        console.error("Auditoría de error:", error);
        statusEl.style.display = 'block';
        statusEl.textContent = "Error de conexión. Reintentando en 5s...";
        setTimeout(consultarAPI, 5000);
    }
}

function renderizarTarjetas(lista) {
    const contenedor = document.getElementById('crypto-container');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    lista.forEach((ticker, index) => {
        const precioActual = parseFloat(ticker.lastPr || 0);
        const precioApertura = parseFloat(ticker.open || 0);
        const volumen = parseFloat(ticker.quoteVolume || 0);
        
        let cambio = precioApertura > 0 ? ((precioActual - precioApertura) / precioApertura) * 100 : 0;
        if (!isFinite(cambio) || isNaN(cambio)) cambio = 0;

        const card = document.createElement('div');
        card.className = 'card';
        
        // Seguridad: Elementos estructurales fijos en HTML, datos dinámicos en textContent
        card.innerHTML = `
            <span class="ranking">#${index + 1}</span>
            <h3>${ticker.base} (USDT)</h3>
            <p class="precio"></p>
            <p class="cambio"></p>
            <p class="volumen" style="font-size: 0.75rem; color: #888; margin-top: 5px;"></p>
            <button class="btn-grafica">Ver Gráfica</button>
        `;
        
        card.querySelector('.precio').textContent = `$${precioActual < 1 ? precioActual.toFixed(8) : precioActual.toFixed(2)}`;
        const cambioEl = card.querySelector('.cambio');
        cambioEl.textContent = `${cambio >= 0 ? '+' : ''}${cambio.toFixed(2)}%`;
        cambioEl.className = cambio >= 0 ? 'positivo' : 'negativo';
        
        card.querySelector('.volumen').textContent = `Vol 24h: ${volumen.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
        card.querySelector('.btn-grafica').onclick = () => window.location.href = `grafica.html?id=${ticker.base.toLowerCase()}`;
        
        contenedor.appendChild(card);
    });
}

consultarAPI();
setInterval(consultarAPI, 10000);