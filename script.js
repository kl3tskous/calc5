<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crypto Stop-Loss Calculator</title>
  <link rel="stylesheet" href="style.css">
  <!-- Include Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <h1>Crypto Stop-Loss Calculator</h1>

    <!-- Cryptocurrency Selection -->
    <div class="crypto-selection">
      <button onclick="selectCrypto('bitcoin')">BTC</button>
      <button onclick="selectCrypto('ethereum')">ETH</button>
      <button onclick="selectCrypto('solana')">SOL</button>
    </div>

    <!-- Entry Price Display -->
    <div id="entry-price">Entry Price: --</div>

    <!-- Stop-Loss Calculator Form -->
    <div class="calculator-form">
      <label>
        Amount in Trade (USD):
        <input type="number" id="tradeAmount" placeholder="Enter trade amount">
      </label>
      <label>
        Portfolio Size (USD):
        <input type="number" id="portfolioSize" placeholder="Enter portfolio size">
      </label>
      <label>
        Risk Percentage (%):
        <input type="number" id="riskPercentage" placeholder="Enter risk percentage">
      </label>
      <label>
        Leverage:
        <input type="number" id="leverage" placeholder="Enter leverage (e.g., 1)">
      </label>
      <label>
        Position Type:
        <select id="positionType">
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
      </label>
      <button onclick="calculateStopLoss()">Calculate Stop-Loss</button>
    </div>

    <!-- Stop-Loss Price Display -->
    <div id="stop-loss-result">Stop-Loss Price: --</div>

    <!-- Candlestick Chart -->
    <div id="chart-container">
      <!-- Chart will be rendered here -->
      <canvas id="chart"></canvas>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>
