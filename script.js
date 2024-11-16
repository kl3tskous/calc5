let entryPrice = 0;
let chart, candleSeries, stopLossLineSeries;

// Function to select a cryptocurrency and fetch live price
async function selectCrypto(cryptoId, symbol) {
    const entryPriceField = document.getElementById("entry-price");
    entryPriceField.innerText = "Fetching...";

    const proxyUrl = "https://corsproxy.io/?";
    const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`;
    const url = `${proxyUrl}${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch live price.");
        const data = await response.json();

        entryPrice = parseFloat(data.price);
        entryPriceField.innerText = `Entry Price: $${entryPrice.toFixed(2)} USD`;
        loadCandlestickChart(symbol);
    } catch (error) {
        entryPriceField.innerText = "Error fetching price.";
        console.error("Error fetching live price:", error);
    }
}

// Function to toggle custom entry price input
function toggleCustomEntryPrice() {
    const useCustomEntry = document.getElementById("useCustomEntryPrice").checked;
    const customEntryInput = document.getElementById("customEntryPrice");
    const entryPriceDisplay = document.getElementById("entry-price");

    if (useCustomEntry) {
        customEntryInput.style.display = "block";
        entryPriceDisplay.style.display = "none";
    } else {
        customEntryInput.style.display = "none";
        entryPriceDisplay.style.display = "block";
    }
}

// Function to load the candlestick chart
async function loadCandlestickChart(symbol) {
    try {
        const proxyUrl = "https://corsproxy.io/?";
        const apiUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=50`;
        const url = `${proxyUrl}${encodeURIComponent(apiUrl)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch candlestick data.");
        const data = await response.json();

        const candlestickData = data.map(candle => ({
            time: candle[0] / 1000,
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
        }));

        if (!chart) {
            chart = LightweightCharts.createChart(document.getElementById("chart"), {
                width: document.getElementById("chart-container").offsetWidth,
                height: 200,
                layout: { backgroundColor: '#0d0e13', textColor: '#e0e0e0' },
                grid: { vertLines: { color: '#2a2a2a' }, horzLines: { color: '#2a2a2a' } },
                timeScale: { timeVisible: true, borderColor: '#2a2a2a' },
                priceScale: { borderColor: '#2a2a2a' },
            });
            candleSeries = chart.addCandlestickSeries();
        }

        candleSeries.setData(candlestickData);
    } catch (error) {
        console.error("Error loading candlestick data:", error);
        alert("Error loading candlestick data. Please try again.");
    }
}

// Function to calculate stop-loss price
function calculateStopLoss() {
    const useCustomEntry = document.getElementById("useCustomEntryPrice").checked;
    const customEntryPrice = parseFloat(document.getElementById("customEntryPrice").value);
    const effectiveEntryPrice = useCustomEntry && !isNaN(customEntryPrice) ? customEntryPrice : entryPrice;

    const tradeAmount = parseFloat(document.getElementById("trade-amount")?.value);
    const portfolioSize = parseFloat(document.getElementById("portfolio-size")?.value);
    const riskPercentage = parseFloat(document.getElementById("risk-percentage")?.value) / 100;
    const leverage = parseFloat(document.getElementById("leverage")?.value);
    const position = document.getElementById("position-type").value;

    if (isNaN(effectiveEntryPrice) || isNaN(tradeAmount) || isNaN(portfolioSize) || isNaN(riskPercentage) || isNaN(leverage)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const dollarRisk = portfolioSize * riskPercentage;
    const priceMovement = (dollarRisk / (tradeAmount / effectiveEntryPrice)) / leverage;
    const stopLossPrice = (position === "long") ? effectiveEntryPrice - priceMovement : effectiveEntryPrice + priceMovement;

    document.getElementById("stop-loss-result").innerText = `Stop-Loss Price: $${stopLossPrice.toFixed(2)}`;
    updateStopLossLine(stopLossPrice);
}

// Function to update stop-loss line on the chart
function updateStopLossLine(stopLossPrice) {
    if (chart && candleSeries) {
        if (stopLossLineSeries) {
            chart.removeSeries(stopLossLineSeries);
        }

        stopLossLineSeries = chart.addLineSeries({ color: 'red', lineWidth: 2 });
        const visibleRange = chart.timeScale().getVisibleRange();
        stopLossLineSeries.setData([
            { time: visibleRange.from, value: stopLossPrice },
            { time: visibleRange.to, value: stopLossPrice }
        ]);
    }
}

window.addEventListener("resize", () => {
    if (chart) {
        chart.resize(document.getElementById("chart-container").offsetWidth, 200);
    }
});