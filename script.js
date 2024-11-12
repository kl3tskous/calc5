let entryPrice = 0;
let selectedCrypto = 'bitcoin';
let stopLossPrice = 0;

// Load chart data on initialization
async function selectCrypto(crypto) {
  selectedCrypto = crypto;
  await fetchPrice();
  loadChart(); // Load chart after fetching price
}

// Fetch the current price of the selected cryptocurrency
async function fetchPrice() {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=usd`);
    const data = await response.json();
    entryPrice = data[selectedCrypto].usd;
    document.getElementById("entry-price").innerText = `Entry Price: $${entryPrice}`;
  } catch (error) {
    console.error("Error fetching price:", error);
    alert("Error fetching price. Please try again.");
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

// Load and initialize the chart
function loadChart() {
  const ctx = document.getElementById("chart").getContext("2d");

  // Dummy data for demonstration; replace with actual data in production
  const labels = Array.from({ length: 20 }, (_, i) => i + 1); // X-axis labels
  const prices = labels.map(i => entryPrice + (Math.random() - 0.5) * 10); // Random price data around entry price

  const data = {
    labels: labels,
    datasets: [
      {
        label: `${selectedCrypto.toUpperCase()} Price`,
        data: prices,
        borderColor: "#58a6ff",
        fill: false,
        tension: 0.1,
      }
    ]
  };

  // Create or update chart
  if (window.myChart) {
    window.myChart.data = data;
    window.myChart.update();
  } else {
    window.myChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
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
  selectCrypto(selectedCrypto); // Load initial price and chart
});
