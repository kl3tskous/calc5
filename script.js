let entryPrice = 0;
let selectedCrypto = 'BTCUSDT'; // Default to Bitcoin/US Dollar pair on Binance
let stopLossPrice = 0;

// Load chart data on initialization
async function selectCrypto(crypto) {
  selectedCrypto = crypto + 'USDT'; // Format for Binance API (e.g., BTCUSDT, ETHUSDT)
  await fetchPrice();
  await loadCandlestickChart(); // Load candlestick chart after fetching price
}

// Fetch the current price of the selected cryptocurrency
async function fetchPrice() {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto.slice(0, -4).toLowerCase()}&vs_currencies=usd`);
    const data = await response.json();
    entryPrice = data[selectedCrypto.slice(0, -4).toLowerCase()].usd;
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
    
    // Convert the data into candlestick format for Chart.js
    const candlestickData = data.map(candle => ({
      x: new Date(candle[0]), // Timestamp
      o: parseFloat(candle[1]), // Open
      h: parseFloat(candle[2]), // High
      l: parseFloat(candle[3]), // Low
      c: parseFloat(candle[4])  // Close
    }));

    // Create or update candlestick chart
    const ctx = document.getElementById("chart").getContext("2d");

    if (window.myChart) {
      window.myChart.data.datasets[0].data = candlestickData;
      window.myChart.update();
    } else {
      window.myChart = new Chart(ctx, {
        type: 'candlestick',
        data: {
          datasets: [{
            label: `${selectedCrypto.slice(0, -4)} Price (15m)`,
            data: candlestickData,
            borderColor: "#58a6ff",
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'minute'
              },
              title: {
                display: true,
                text: 'Time'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Price (USD)'
              }
            }
          },
          plugins: {
            annotation: {
              annotations: {}
            }
          }
        }
      });
    }
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

  // Calculate the dollar amount the user is willing to lose
  const riskAmount = portfolioSize * (riskPercentage / 100);

  // Calculate stop-loss price based on risk amount and leverage
  if (positionType === "long") {
    stopLossPrice = entryPrice - (riskAmount / (tradeAmount * leverage));
  } else if (positionType === "short") {
    stopLossPrice = entryPrice + (riskAmount / (tradeAmount * leverage));
  }

  document.getElementById("stop-loss-result").innerText = `Stop-Loss Price: $${stopLossPrice.toFixed(2)}`;
  updateChartWithStopLoss(stopLossPrice);
}

// Update chart to display a stop-loss line
function updateChartWithStopLoss(stopLossPrice) {
  if (window.myChart) {
    // Use Chart.js plugin to add a stop-loss line
    window.myChart.options.plugins.annotation = {
      annotations: {
        line1: {
          type: 'line',
          yMin: stopLossPrice,
          yMax: stopLossPrice,
          borderColor: 'red',
          borderWidth: 2,
          label: {
            content: `Stop-Loss ($${stopLossPrice.toFixed(2)})`,
            enabled: true,
            position: 'end'
          }
        }
      }
    };
    window.myChart.update();
  }
}

// Initialize chart and fetch initial data on page load
document.addEventListener("DOMContentLoaded", () => {
  selectCrypto("BTC"); // Load initial price and chart with Bitcoin as default
});
