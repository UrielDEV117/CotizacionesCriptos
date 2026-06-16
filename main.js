console.log("Conectado a Bitget API v2 - Sistema de iconos restaurado");

const API_URL = 'https://api.bitget.com/api/v2/spot/market/tickers';
const TOP_CRIPTOS = [
    'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'TRX', 'DOT',
    'UNI', 'AAVE', 'MKR', 'COMP', 'CRV', 'SUSHI', 'DYDX', 'LDO', 'GMX', 'PENDLE', 'ENA',
    'FET', 'WLD', 'RNDR', 'NEAR', 'GRT', 'OCEAN',
    'PEPE', 'WIF', 'FLOKI', 'BONK', 'SHIB',
    'IMX', 'BEAM', 'GALA', 'SAND', 'MANA', 'AXS', 'ENJ',
    'SUI', 'SEI', 'TIA', 'STRK', 'ARB', 'OP', 'POL', 'KAS', 'LUMIA'
];

// Mapa consolidado para evitar bloqueos y asegurar que todos los logos carguen
const ICONOS_MAPA = {
    "BTC": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    "ETH": "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    "SOL": "https://cryptologos.cc/logos/solana-sol-logo.png",
    "BNB": "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    "XRP": "https://cryptologos.cc/logos/xrp-xrp-logo.png",
    "ADA": "https://cryptologos.cc/logos/cardano-ada-logo.png",
    "DOGE": "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
    "AVAX": "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    "TRX": "https://cryptologos.cc/logos/tron-trx-logo.png",
    "DOT": "https://cryptologos.cc/logos/polkadot-new-dot-logo.png",
    "UNI": "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    "AAVE": "https://cryptologos.cc/logos/aave-aave-logo.png",
    "MKR": "https://cryptologos.cc/logos/maker-mkr-logo.png",
    "COMP": "https://cryptologos.cc/logos/compound-comp-logo.png",
    "CRV": "https://cryptologos.cc/logos/curve-dao-token-crv-logo.png",
    "SUSHI": "https://cryptologos.cc/logos/sushiswap-sushi-logo.png",
    "DYDX": "https://cryptologos.cc/logos/dydx-dydx-logo.png",
    "LDO": "https://cryptologos.cc/logos/lido-dao-ldo-logo.png",
    "GMX": "https://assets.coingecko.com/coins/images/18323/large/gmx.png",
    "PENDLE": "https://cryptologos.cc/logos/pendle-pendle-logo.png",
    "ENA": "https://cryptologos.cc/logos/ethena-ena-logo.png",
    "FET": "https://assets.coingecko.com/coins/images/2016/large/fetch-ai.png",
    "WLD": "https://assets.coingecko.com/coins/images/29729/large/worldcoin.png",
    "RNDR": "https://cryptologos.cc/logos/render-rndr-logo.png",
    "NEAR": "https://cryptologos.cc/logos/near-protocol-near-logo.png",
    "GRT": "https://cryptologos.cc/logos/the-graph-grt-logo.png",
    "OCEAN": "https://cryptologos.cc/logos/ocean-protocol-ocean-logo.png",
    "PEPE": "https://cryptologos.cc/logos/pepe-pepe-logo.png",
    "WIF": "https://assets.coingecko.com/coins/images/33566/large/dogwifhat.png",
    "FLOKI": "https://assets.coingecko.com/coins/images/16746/large/floki.png",
    "BONK": "https://assets.coingecko.com/coins/images/28600/large/bonk.png",
    "SHIB": "https://cryptologos.cc/logos/shiba-inu-shib-logo.png",
    "IMX": "https://cryptologos.cc/logos/immutable-x-imx-logo.png",
    "BEAM": "https://cryptologos.cc/logos/beam-beam-logo.png",
    "GALA": "https://cryptologos.cc/logos/gala-gala-logo.png",
    "SAND": "https://cryptologos.cc/logos/the-sandbox-sand-logo.png",
    "MANA": "https://cryptologos.cc/logos/decentraland-mana-logo.png",
    "AXS": "https://cryptologos.cc/logos/axie-infinity-axs-logo.png",
    "ENJ": "https://cryptologos.cc/logos/enjin-coin-enj-logo.png",
    "SUI": "https://cryptologos.cc/logos/sui-sui-logo.png",
    "SEI": "https://cryptologos.cc/logos/sei-sei-logo.png",
    "TIA": "https://cryptologos.cc/logos/celestia-tia-logo.png",
    "STRK": "https://assets.coingecko.com/coins/images/26483/large/starknet.png",
    "ARB": "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
    "OP": "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
    "POL": "https://cryptologos.cc/logos/polygon-matic-logo.png",
    "KAS": "https://cryptologos.cc/logos/kaspa-kas-logo.png",
    "LUMIA": "https://assets.coingecko.com/coins/images/38605/large/lumia.png"
};

async function consultarAPI() {
    try {
        const respuesta = await fetch(API_URL);
        const datos = await respuesta.json();
        if (datos.code === "00000" && datos.data) {
            const lista = datos.data
                .filter(t => t.symbol.endsWith('USDT'))
                .map(t => ({ ...t, base: t.symbol.replace('USDT', '') }))
                .filter(t => TOP_CRIPTOS.includes(t.base))
                .sort((a, b) => TOP_CRIPTOS.indexOf(a.base) - TOP_CRIPTOS.indexOf(b.base));
            renderizarTarjetas(lista);
        }
    } catch (e) { console.error("Error API:", e); }
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
        
        const iconoSrc = ICONOS_MAPA[ticker.base] || `https://ui-avatars.com/api/?name=${ticker.base}&background=f0b90b&color=000&size=128`;

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <span class="ranking">#${index + 1}</span>
            <img src="${iconoSrc}" alt="${ticker.base}" style="width: 50px; height: 50px; margin: 10px auto; display: block; border-radius: 50%;">
            <h3>${ticker.base} (USDT)</h3>
            <p class="precio">$${precioActual < 1 ? precioActual.toFixed(8) : precioActual.toFixed(2)}</p>
            <p class="${cambio >= 0 ? 'positivo' : 'negativo'}">${cambio.toFixed(2)}%</p>
            <p class="volumen" style="font-size: 0.75rem; color: #888; margin-top: 5px;">Vol 24h: ${volumen.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <button class="btn-grafica" onclick="window.location.href='grafica.html?id=${ticker.base.toLowerCase()}'">Ver Gráfica</button>
        `;
        contenedor.appendChild(card);
    });
}

consultarAPI();
setInterval(consultarAPI, 10000);