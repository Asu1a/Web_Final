fetch('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=0DAE06Y3V5H39KFU')
        .then(response => response.json())
        .then(data => {
            const series = data['Time Series (5min)'];
            const labels = Object.keys(series).map(date => new Date(date).toLocaleTimeString());
            const prices = Object.keys(series).map(date => series[date]['4. close']);

            const ctx = document.getElementById('stockChart').getContext('2d');
            const stockChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.reverse(),
                    datasets: [{
                        label: 'IBM Stock Price (Last 100 5min Intervals)',
                        data: prices.reverse(),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                }
            });
        });