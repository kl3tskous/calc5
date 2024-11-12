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
        width: 600,  // Adjusted width to make the chart smaller
        height: 300, // Adjusted height to make the chart smaller
        layout: { backgroundColor: '#0d0e13', textColor: '#e0e0e0' },
        grid: { vertLines: { color: '#2a2a2a' }, horzLines: { color: '#2a2a2a' } },
        timeScale: { timeVisible: true, borderColor: '#2a2a2a' },
        priceScale: { borderColor: '#2a2a2a' },
      });
      candleSeries = chart.addCandlestickSeries();
    }

    candleSeries.setData(candlestickData);

    // Clear previous stop-loss line if it exists
    if (stopLossLineSeries) {
      chart.removeSeries(stopLossLineSeries);
      stopLossLineSeries = null;
    }
  } catch (error) {
    console.error("Error loading candlestick data:", error);
    alert("Error loading candlestick data. Please try again.");
  }
}

function calculateStopLoss() {
  const tradeAmount = parseFloat(document.getElementById("tradeAmount").value);
  const tradeAmountType = document.getElementById("tradeAmountType").value;
  const portfolioSize = parseFloat(document.getElementById("portfolioSize").value);
  const riskPercentage = parseFloat(document.getElementById("riskPercentage").value);
  const leverage = parseFloat(document.getElementById("leverage").value);
  const positionType = document.getElementById("positionType").value;

  if (isNaN(tradeAmount) || isNaN(portfolioSize) || isNaN(riskPercentage) || isNaN(leverage) || !entryPrice) {
    alert("Please fill in all fields correctly.");
    return;
  }

  // Convert trade amount to crypto if entered in USD
  const positionSize = tradeAmountType === "usd" ? tradeAmount / entryPrice : tradeAmount;

  const initialMargin = (positionSize * entryPrice) / leverage;
  const riskAmount = portfolioSize * (riskPercentage / 100);

  if (positionType === "long") {
    stopLossPrice = entryPrice - (riskAmount / initialMargin);
  } else if (positionType === "short") {
    stopLossPrice = entryPrice + (riskAmount / initialMargin);
  }

  document.getElementById("stop-loss-result").innerText = `Stop-Loss Price: $${stopLossPrice.toFixed(2)}`;
  updateStopLossLine(stopLossPrice);
}

function updateStopLossLine(stopLossPrice) {
  if (chart && candleSeries) {
    // Add or update a horizontal line overlay at the stop-loss price
    if (!stopLossLineSeries) {
      stopLossLineSeries = chart.addLineSeries({
        color: 'red',
        lineWidth: 2,
      });
    }

    // Set the stop-loss line data
    stopLossLineSeries.setData([
      { time: chart.timeScale().getVisibleRange().from, value: stopLossPrice },
      { time: chart.timeScale().getVisibleRange().to, value: stopLossPrice }
    ]);

    // Clear previous markers
    candleSeries.setMarkers([]);

    // Add a marker for the stop-loss price with a label
    candleSeries.setMarkers([
      {
        time: chart.timeScale().getVisibleRange().from, // Position at start of visible chart
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
