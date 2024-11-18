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
        if (!response.ok) throw new Error("Failed to fetch live price.");

        const data = await response.json();
        const parsedData = JSON.parse(data.contents); // Parse response through allorigins proxy

        entryPrice = parsedData[cryptoId]?.usd;

        if (entryPrice) {
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

// Function to toggle between modes
function switchMode() {
    const isMarginMode = document.getElementById("modeToggle").checked;
    const stopLossMode = document.getElementById("stopLossMode");
    const marginLeverageMode = document.getElementById("marginLeverageMode");
    const stopLossResult = document.getElementById("stop-loss-result");
    const marginLeverageResult = document.getElementById("margin-leverage-result");

    if (isMarginMode) {
        stopLossMode.style.display = "none";
        marginLeverageMode.style.display = "block";
        stopLossResult.style.display = "none";
        marginLeverageResult.style.display = "block";
    } else {
        stopLossMode.style.display = "block";
        marginLeverageMode.style.display = "none";
        stopLossResult.style.display = "block";
        marginLeverageResult.style.display = "none";
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
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=50`);
        if (!response.ok) throw new Error("Failed to load candlestick data.");

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

// Function to calculate stop-loss price for isolated margin mode
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

// Function to calculate margin and leverage
function calculateMarginLeverage() {
    const stopLossPrice = parseFloat(document.getElementById("stop-loss-price").value);
    const portfolioSize = parseFloat(document.getElementById("portfolio-size-ml").value);
    const riskPercentage = parseFloat(document.getElementById("risk-percentage-ml").value) / 100;
    const fixedLeverage = parseFloat(document.getElementById("fixed-leverage").value);

    if (isNaN(stopLossPrice) || isNaN(portfolioSize) || isNaN(riskPercentage)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const dollarRisk = portfolioSize * riskPercentage;
    const priceMovement = Math.abs(stopLossPrice - entryPrice);
    const marginRequired = dollarRisk / priceMovement;
    const leverage = fixedLeverage || marginRequired / (portfolioSize * riskPercentage);

    document.getElementById("margin-leverage-result").innerText = `Margin: $${marginRequired.toFixed(2)}, Leverage: ${leverage.toFixed(2)}x`;
}
