let entryPrice = 0;
let chart, candleSeries, stopLossLineSeries;

// Function to select a cryptocurrency and fetch live price
async function selectCrypto(cryptoId, symbol) {
    fetchPrice(cryptoId);
    loadCandlestickChart(symbol);
}

async function fetchPrice(cryptoId) {
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
        } else {
            entryPriceField.innerText = "Price not available";
        }
    } catch (error) {
        entryPriceField.innerText = "Error fetching price";
        console.error("Error fetching live price:", error);
    }
}

// New function to refresh the entry price
function refreshEntryPrice() {
    const cryptoId = document.querySelector(".crypto-selection button.active")?.getAttribute("data-id");
    if (cryptoId) {
        fetchPrice(cryptoId);
    } else {
        alert("Please select a cryptocurrency first.");
    }
}

// Other existing functions remain unchanged (calculateStopLoss, loadCandlestickChart, etc.)
