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
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Ensure we extract the price correctly
        if (data[cryptoId] && data[cryptoId].usd) {
            entryPrice = data[cryptoId].usd;
            entryPriceField.innerText = `Entry Price: $${entryPrice.toFixed(2)} USD`;
            loadCandlestickChart(symbol);
        } else {
            entryPriceField.innerText = "Price not available";
        }
    } catch (error) {
        entryPriceField.innerText = "Error fetching price";
        console.error("Error fetching live price:", error);
    }
}

// Load Candlestick Chart
async function loadCandlestickChart(symbol) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=50`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
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
    const useCustomEntry = document.getElementById("useCustomEntryPrice").checked;
    const customEntryPrice = parseFloat(document.getElementById("customEntryPrice").value);
    const effectiveEntryPrice = useCustomEntry && !isNaN(customEntryPrice) ? customEntryPrice : entryPrice;

    const tradeAmount = parseFloat(document.getElementById("trade-amount").value);
    const portfolioSize = parseFloat(document.getElementById("portfolio-size").value);
    const riskPercentage = parseFloat(document.getElementById("risk-percentage").value) / 100;
    const leverage = parseFloat(document.getElementById("leverage").value);
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