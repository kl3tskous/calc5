let entryPrice = 0;
let selectedCrypto = 'bitcoin';

async function selectCrypto(crypto) {
  selectedCrypto = crypto;
  await fetchPrice();
}

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

  const riskAmount = portfolioSize * (riskPercentage / 100);
  let stopLossPrice = entryPrice - (riskAmount / (tradeAmount * leverage));

  if (positionType === "short") {
    stopLossPrice = entryPrice + (riskAmount / (tradeAmount * leverage));
  }

  document.getElementById("stop-loss-result").innerText = `Stop-Loss Price: $${stopLossPrice.toFixed(2)}`;
  updateChartWithStopLoss(stopLossPrice);
}

function loadChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  const data = {
    labels: [], // Placeholder, should add time labels
    datasets: [
      {
        label: `${selectedCrypto} Price`,
        data: [], // Placeholder, should add price data
        borderColor: "#58a6ff",
      }
    ]
  };

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute'
          }
        }
      }
    }
  });
}

function updateChartWithStopLoss(stopLossPrice) {
  if (window.myChart) {
    // Add stop-loss line to the chart (if needed)
    console.log(`Stop-loss line set at: ${stopLossPrice}`);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadChart();
  selectCrypto(selectedCrypto); // Load initial price
});
