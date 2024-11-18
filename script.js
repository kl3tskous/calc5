let entryPrice = 0;
let chart, candleSeries, stopLossLineSeries;

// Function to switch between modes
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

// Function to select a cryptocurrency and fetch live price
async function selectCrypto(symbol) {
    const entryPriceField = document.getElementById("entry-price");
    entryPriceField.innerText = "Fetching...";

    const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`;

    try {
        const response = await fetch(apiUrl);
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

// Function to calculate stop-loss price
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
