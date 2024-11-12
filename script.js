let entryPrice = 0;
let chart, candleSeries, stopLossLineSeries;

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

async function loadCandlestickChart(symbol) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=50`);
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

function calculateStopLoss() {
    const useCustomEntry = document.getElementById("useCustomEntryPrice").checked;
    const customEntryPrice = parseFloat(document.getElementById("customEntryPrice").value);
    const effectiveEntryPrice = useCustomEntry && !isNaN(customEntryPrice) ? customEntryPrice : entryPrice;

    const tradeAmount = parseFloat(document.getElementById("trade-amount")?.value);
    const portfolioSize = parseFloat(document.getElementById("portfolio-size")?.value);
    const riskPercentage = parseFloat(document.getElementById("risk-percentage")?.value) / 100;
    const leverage = parseFloat(document.getElementById("leverage")?.value);

    // Log values to ensure elements are being fetched correctly
    console.log({
        effectiveEntryPrice,
        tradeAmount,
        portfolioSize,
        riskPercentage,
        leverage
    });

    if (isNaN(effectiveEntryPrice) || isNaN(tradeAmount) || isNaN(portfolioSize) || isNaN(riskPercentage) || isNaN(leverage)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const isolatedMargin = tradeAmount / leverage;
    const dollarRisk = portfolioSize * riskPercentage;
    const stopLossPrice = effectiveEntryPrice - (dollarRisk / isolatedMargin);

    document.getElementById("stop-loss-result").innerText = `Stop-Loss Price: $${stopLossPrice.toFixed(2)}`;
    updateStopLossLine(stopLossPrice);
}

function updateStopLossLine(stopLossPrice) {
    if (chart && candleSeries) {
        if (stopLossLineSeries) {
            chart.removeSeries(stopLossLineSeries);
        }

        stopLossLineSeries = chart.addLineSeries({
            color: 'red',
            lineWidth: 2,
        });

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
