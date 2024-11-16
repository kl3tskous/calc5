let entryPrice = 0;
let chart, candleSeries, stopLossLineSeries;

// Switch between Stop-Loss and Position Size modes
function switchMode(mode) {
    document.getElementById("stopLossForm").style.display = (mode === "stopLoss") ? "block" : "none";
    document.getElementById("positionSizeForm").style.display = (mode === "positionSize") ? "block" : "none";
    document.getElementById("result").innerText = "Result: --";
}

// Select Cryptocurrency and Load Price/Chart
async function selectCrypto(cryptoId, symbol) {
    const entryPriceField = document.getElementById("entry-price");
    entryPriceField.innerText = "Fetching...";

    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        entryPrice = data[cryptoId]?.usd || 0;
        entryPriceField.innerText = `Entry Price: $${entryPrice.toFixed(2)} USD`;
        loadCandlestickChart(symbol);
    } catch (error) {
        entryPriceField.innerText = "Error fetching price";
        console.error("Error fetching live price:", error);
    }
}

// Load Candlestick Chart
async function loadCandlestickChart(symbol) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=50`);
        const data = await response.json();

        const chartData = data.map(c => ({
            time: c[0] / 1000,
            open: parseFloat(c[1]),
            high: parseFloat(c[2]),
            low: parseFloat(c[3]),
            close: parseFloat(c[4]),
        }));

        if (!chart) {
            chart = LightweightCharts.createChart(document.getElementById("chart"), {
                width: 350,
                height: 200,
                layout: { backgroundColor: "#0d0e13", textColor: "#e0e0e0" },
                grid: { vertLines: { color: "#2a2a2a" }, horzLines: { color: "#2a2a2a" } },
            });
            candleSeries = chart.addCandlestickSeries();
        }

        candleSeries.setData(chartData);
    } catch (error) {
        console.error("Error loading candlestick data:", error);
    }
}

// Calculate Stop-Loss
function calculateStopLoss() {
    // Code for calculating stop-loss...
}

// Calculate Position Size
function calculatePositionSize() {
    // Code for calculating position size...
}