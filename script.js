let entryPrice = 0;
let chart, candleSeries, stopLossLineSeries;

// Function to select a cryptocurrency and fetch live price
async function selectCrypto(cryptoId, symbol) {
    const entryPriceField = document.getElementById("entry-price");
    entryPriceField.innerText = "Fetching...";

    const proxyUrl = "https://api.allorigins.win/get?url=";
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
    const url = `${proxyUrl}${encodeURIComponent(apiUrl)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const parsedData = JSON.parse(data.contents);

        entryPrice = parsedData[cryptoId]?.usd;

        if (entryPrice) {
            entryPriceField.innerText = `Entry Price: $${entryPrice.toFixed(2)} USD`;
            loadCandlestickChart(symbol); // Ensure this function is called after fetching the price
        } else {
            entryPriceField.innerText = "Price not available";
        }
    } catch (error) {
        entryPriceField.innerText = "Error fetching price";
        console.error("Error fetching live price:", error);
    }
}

// Function to load candlestick chart for selected symbol
async function loadCandlestickChart(symbol) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=50`);

        if (!response.ok) {
            console.error(`API response status: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to load data. Status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Unexpected data format from API");
        }

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
        alert("Error loading candlestick data. Please check your network or try again.");
    }
}

// Function to calculate stop-loss price based on the user's input
function calculateStopLoss() {
    const tradeAmount = parseFloat(document.getElementById("trade-amount").value);
    const portfolioSize = parseFloat(document.getElementById("portfolio-size").value);
    const riskPercentage = parseFloat(document.getElementById("risk-percentage").value) / 100;
    const leverage = parseFloat(document.getElementById("leverage").value);
    const position = document.getElementById("position-type").value;

    if (isNaN(entryPrice) || isNaN(tradeAmount) || isNaN(portfolioSize) || isNaN(riskPercentage) || isNaN(leverage)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const dollarRisk = portfolioSize * riskPercentage;
    const priceMovement = (dollarRisk / (tradeAmount / entryPrice)) / leverage;
    const stopLossPrice = (position === "long") ? entryPrice - priceMovement : entryPrice + priceMovement;

    document.getElementById("stop-loss-result").innerText = `Stop-Loss Price: $${stopLossPrice.toFixed(2)}`;
    updateStopLossLine(stopLossPrice);
}

// Function to update the stop-loss line on the chart
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

// Function to refresh the entry price (re-fetch from the selected cryptocurrency)
function refreshEntryPrice() {
    const cryptoId = document.querySelector(".crypto-selection button.active")?.getAttribute("data-id");
    if (cryptoId) {
        selectCrypto(cryptoId);
    } else {
        alert("Please select a cryptocurrency first.");
    }
}
