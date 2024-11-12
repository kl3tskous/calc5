let entryPrice = 0;
let selectedCrypto = 'BTCUSDT';
let stopLossPrice = 0;
let chart, candleSeries;

// Load chart data on initialization
async function selectCrypto(crypto) {
  selectedCrypto = crypto + 'USDT';
  await fetchPrice();
  await loadCandlestickChart();
}

// Fetch the current price of the selected cryptocurrency
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

// Fetch 15-minute interval candlestick data from Binance API and update chart
async function loadCandlestickChart() {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${selectedCrypto}&interval=15m&limit=50`);
    const data = await response.json();
    
    const candlestickData = data.map(candle => ({
      time: candle[0] / 1000, // Convert from ms to seconds
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
    }));

    if (!chart) {
      chart = LightweightCharts.createChart(document.getElementById("chart"), {
        width: 800,
        height: 400,
        layout: {
          backgroundColor: '#121212',
          textColor: '#e0e0e0',
        },
        grid: {
          vertLines: { color: '#2a2a2a' },
          horzLines: { color: '#2a2a2a' },
        },
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

// Calculate stop-loss based on the user's risk tolerance and leverage
function calculateStopLoss() {
  const tradeAmount = parseFloat(document.getElementById("tradeAmount").value);
  const portfolioSize = parseFloat(document.getElementById("portfolioSize").value);
  const riskPercentage = parseFloat(document.getElementById("riskPercentage").value);
  const leverage = parseFloat(document.getElementById("leverage").value);
  const positionType = document.getElementById("positionType").value;

  if (isNaN(tradeAmount) || isNaN(portfolioSize) || isNaN(riskPercentage) || isNaN(leverage) || !entryPrice) {
    alert("Please fill in all fields correctly.");
    return;
  }

  // Calculate the dollar amount the user is willing to lose (risk amount)
  const riskAmount = portfolioSize * (riskPercentage / 100);

  // Calculate stop-loss price based on risk amount and leverage
  if (positionType === "long") {
    stopLossPrice = entryPrice - (riskAmount / (tradeAmount * leverage));
  } else if (positionType === "short") {
    stopLossPrice = entryPrice + (riskAmount / (tradeAmount * leverage));
  }

  // Display the stop-loss price
  document.getElementById("stop-loss-result").innerText = `Stop-Loss Price: $${stopLossPrice.toFixed(2)}`;
  updateStopLossLine(stopLossPrice);
}


  const riskAmount = portfolioSize * (riskPercentage / 100);

  if (positionType === "long") {
    stopLossPrice = entryPrice - (riskAmount / (tradeAmount * leverage));
  } else if (positionType === "short") {
    stopLossPrice = entryPrice + (riskAmount / (tradeAmount * leverage));
  }

  document.getElementById("stop-loss-result").innerText = `Stop-Loss Price: $${stopLossPrice.toFixed(2)}`;
  updateStopLossLine(stopLossPrice);
}

// Update chart to display a stop-loss line
function updateStopLossLine(stopLossPrice) {
  if (candleSeries && chart) {
    // Clear existing series and add the main candle series again
    chart.removeSeries(candleSeries);
    candleSeries = chart.addCandlestickSeries();
    
    // Reapply the data (to ensure line updates)
    loadCandlestickChart();

    // Add a horizontal line at the stop-loss price
    candleSeries.applyOptions({
      priceLineVisible: true,
      priceLineColor: 'red',
      priceLineWidth: 2,
      priceLineVisible: true,
      priceLineSource: LightweightCharts.PriceLineSource.LastBar,
      priceLineWidth: 2,
    });
    
    // Add a stop-loss marker
    candleSeries.setMarkers([
      {
        price: stopLossPrice,
        position: 'belowBar',
        color: 'red',
        shape: 'arrowDown',
        text: `Stop-Loss $${stopLossPrice.toFixed(2)}`,
      },
    ]);
  }
}

// Initialize chart and fetch initial data on page load
document.addEventListener("DOMContentLoaded", () => {
  selectCrypto("BTC");
});
