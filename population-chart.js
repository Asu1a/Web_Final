fetch('https://restcountries.com/v3.1/name/kazakhstan')
    .then(response => response.json())
    .then(data => {
        const countryData = data[0];
        const population = countryData.population;
        const countryName = countryData.name.common;

        createChart(countryName, population);
    })
    .catch(error => console.error('Error fetching data:', error));

function createChart(countryName, population) {
    new Chart(document.getElementById('populationChart'), {
        type: 'bar', 
        data: {
            labels: [countryName], 
            datasets: [{
                label: 'Population',
                data: [population], 
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true, 
                    ticks: {
                        
                        callback: function(value, index, values) {
                            return value.toLocaleString(); 
                        }
                    }
                }
            }
        }
    });
}
