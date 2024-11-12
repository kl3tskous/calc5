let entryPrice = 0;
let selectedCrypto = 'BTCUSDT';
let stopLossPrice = 0;
let chart, candleSeries, stopLossLineSeries;

async function selectCrypto(crypto) {
  selectedCrypto = crypto + 'USDT';
  await fetchPrice();
  await loadCandlestickChart();
}

async function fetchPrice() {
  const cryptoIdMap = {
    'BTCUSDT': 'bitcoin',
    'ETHUSDT': 'ethereum',
    'SOLUSDT': 'solana'
  };
  
  const cryptoId = cryptoIdMap[selectedCrypto];
  
  if (!cryptoId) {
    console.error("Invalid cryptocurrency symbol.");
    return;
  }

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`);
    const data = await response.json();
    
    if (!data[cryptoId] || !data[cryptoId].usd) {
      throw new Error("Unexpected API response format.");
    }

    entryPrice = data[cryptoId].usd;
    document.getElementById("entry-price").innerText = `Entry Price: $${entryPrice}`;
  } catch (error) {
    console.error("Error fetching price:", error);
    alert("Error fetching price. Please try again.");
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

async function loadCandlestickChart() {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${selectedCrypto}&interval=15m&limit=50`);
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
        width: 600,
        height: 250, // Adjusted chart size for better fit
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
  // Check if the user has enabled the custom entry price
  const useCustomEntry = document.getElementById("useCustomEntryPrice").checked;
  const customEntryPrice = parseFloat(document.getElementById("customEntryPrice").value);

  // Get input values
  const tradeAmount = parseFloat(document.getElementById("tradeAmount").value);
  const tradeAmountType = document.getElementById("tradeAmountType").value;
  const portfolioSize = parseFloat(document.getElementById("portfolioSize").value);
  const riskPercentage = parseFloat(document.getElementById("riskPercentage").value);
  const leverage = parseFloat(document.getElementById("leverage").value);
  const positionType = document.getElementById("positionType").value;

  // Use custom entry price if enabled; otherwise, use the fetched entry price
  const effectiveEntryPrice = useCustomEntry && !isNaN(customEntryPrice) ? customEntryPrice : entryPrice;

  if (isNaN(tradeAmount) || isNaN(portfolioSize) || isNaN(riskPercentage) || isNaN(leverage) || isNaN(effectiveEntryPrice)) {
    alert("Please fill in all fields correctly.");
    return;
  }

  // Calculate position size and risk-adjusted stop-loss
  const positionSize = tradeAmountType === "usd" ? tradeAmount / effectiveEntryPrice : tradeAmount;
  const initialMargin = (positionSize * effectiveEntryPrice) / leverage;
  const riskAmount = portfolioSize * (riskPercentage / 100);

  // Calculate stop-loss price based on position type
  if (positionType === "long") {
    stopLossPrice = effectiveEntryPrice - (riskAmount / initialMargin);
  } else if (positionType === "short") {
    stopLossPrice = effectiveEntryPrice + (riskAmount / initialMargin);
  }

  // Display the calculated stop-loss price
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

    candleSeries.setMarkers([
      {
        time: visibleRange.from,
        price: stopLossPrice,
        color: 'red',
        shape: 'arrowDown',
        text: `Stop-Loss: $${stopLossPrice.toFixed(2)}`
      }
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  selectCrypto("BTC");
});
