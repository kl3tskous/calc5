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
  // Map Binance symbols to CoinGecko IDs
  const cryptoIdMap = {
    'BTCUSDT': 'bitcoin',
    'ETHUSDT': 'ethereum',
    'SOLUSDT': 'solana'
  };
  
  const cryptoId = cryptoIdMap[selectedCrypto]; // Get the CoinGecko ID based on selected symbol

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`);
    const data = await response.json();
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
      window.myChart.destroy(); // Destroy existing chart to avoid re-using old data
    }

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
  } catch (error) {
    console.error("Error loading candlestick data:", error);
    alert("Error loading candlestick data. Please try again.");
  }
}

// Remaining functions for stop-loss calculation and updating chart unchanged
