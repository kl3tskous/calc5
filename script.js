async function loadCandlestickChart(symbol) {
    try {
        // Fetch candlestick data from Binance API
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=15m&limit=50`);

        // Check if the response is okay
        if (!response.ok) {
            console.error(`API response status: ${response.status} ${response.statusText}`);
            throw new Error(`Failed to load data. Status: ${response.status}`);
        }

        const data = await response.json();

        // Check if data returned is in expected format
        if (!Array.isArray(data)) {
            throw new Error("Unexpected data format from API");
        }

        // Map the API data to the format required by Lightweight Charts
        const candlestickData = data.map(candle => ({
            time: candle[0] / 1000,
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
        }));

        // Initialize chart if not already initialized
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

        // Set the chart data
        candleSeries.setData(candlestickData);
    } catch (error) {
        // Log the error to the console for debugging
        console.error("Error loading candlestick data:", error);
        alert("Error loading candlestick data. Please check your network or try again.");
    }
}
