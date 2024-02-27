fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily')
    .then(response => response.json())
    .then(data => {
        const labels = data.prices.map(price => {
            const date = new Date(price[0]);
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        });

        const prices = data.prices.map(price => price[1]);

        createChart(labels, prices);
    })
    .catch(error => console.error('Error fetching data:', error));

function createChart(labels, prices) {
    new Chart(document.getElementById('cryptoChart'), {
        type: 'line', // Тип графика: линейный
        data: {
            labels: labels,
            datasets: [{
                label: 'USD',
                data: prices,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false // Начать ось Y не с нуля для лучшей визуализации
                }
            }
        }
    });
}
