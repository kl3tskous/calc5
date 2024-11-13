let entryPrice = 0;
let chart, candleSeries, stopLossLineSeries;

// Function to select cryptocurrency and fetch live price
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
            loadCandlestickChart(symbol);
        } else {
            entryPriceField.innerText = "Price not available";
        }
    } catch (error) {
        entryPriceField.innerText = "Error fetching price";
        console.error("Error fetching live price:", error);
    }
}

// Function to toggle custom entry price input
function toggleCustomEntryPrice() {
    const useCustomEntry = document.getElementById("useCustomEntryPrice").checked;
    const customEntryInput = document.getElementById("customEntryPrice");
    const entryPriceDisplay = document.getElementById("entry-price");

    customEntryInput.style.display = useCustomEntry ? "block" : "none";
    entryPriceDisplay.style.display = useCustomEntry ? "none" : "block";
}

// Function to toggle between modes
function toggleMode() {
    const stopLossForm = document.getElementById("stopLossForm");
    const positionSizeForm = document.getElementById("positionSizeForm");

    if (document.querySelector('input[name="mode"]:checked').value === "stopLoss") {
        stopLossForm.style.display = "block";
        positionSizeForm.style.display = "none";
    } else {
        stopLossForm.style.display = "none";
        positionSizeForm.style.display = "block";
    }
}

// Stop-Loss Calculation Function
function calculateStopLoss() {
    const tradeAmount = parseFloat(document.getElementById("trade-amount").value);
    const portfolioSize = parseFloat(document.getElementById("portfolio-size").value);
    const riskPercentage = parseFloat(document.getElementById("risk-percentage").value) / 100;
    const leverage = parseFloat(document.getElementById("leverage").value);
    const position = document.getElementById("position-type").value;
    const effectiveEntryPrice = document.getElementById("useCustomEntryPrice").checked 
        ? parseFloat(document.getElementById("customEntryPrice").value) 
        : entryPrice;

    if (isNaN(effectiveEntryPrice) || isNaN(tradeAmount) || isNaN(portfolioSize) || isNaN(riskPercentage) || isNaN(leverage)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const dollarRisk = portfolioSize * riskPercentage;
    const priceMovement = (dollarRisk / (tradeAmount / effectiveEntryPrice)) / leverage;
    const stopLossPrice = position === "long" 
        ? effectiveEntryPrice - priceMovement 
        : effectiveEntryPrice + priceMovement;

    document.getElementById("result").innerText = `Stop-Loss Price: $${stopLossPrice.toFixed(2)}`;
}

// Position Size Calculation Function
function calculatePositionSize() {
    const stopLossPrice = parseFloat(document.getElementById("stop-loss-price").value);
    const portfolioSize = parseFloat(document.getElementById("portfolio-size-ps").value);
    const riskPercentage = parseFloat(document.getElementById("risk-percentage-ps").value) / 100;
    const leverage = parseFloat(document.getElementById("leverage-ps").value);

    if (isNaN(entryPrice) || isNaN(stopLossPrice) || isNaN(portfolioSize) || isNaN(riskPercentage) || isNaN(leverage)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const riskAmount = portfolioSize * riskPercentage;
    const priceDifference = Math.abs(entryPrice - stopLossPrice);
    const positionSize = (riskAmount * leverage) / priceDifference;

    document.getElementById("result").innerText = `Position Size: $${positionSize.toFixed(2)}`;
}

// Chart loading and update functions omitted for brevity (use existing code for chart functionality)
