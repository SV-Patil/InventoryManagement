// Fetch data from the backend
fetch('/data/bar')
.then(response => response.json())
.then(data => {
    const labels = data['labels'];
    const value1 = data['dataset1'];
    const value2 = data['dataset2'];

    const ctx = document.getElementById('mybar').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: value1
                },
                {
                    label: 'Profit',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    data: value2
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
})
.catch(error => console.error('Error fetching data:', error));
//pie chart
fetch('/data/pie')
.then(response => response.json())
.then(data => {
    const labels = Object.keys(data);
    const values = Object.values(data);

    const ctx = document.getElementById('mypie').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    display:false
                }
            }
        }
    });
})
.catch(error => console.error('Error fetching data:', error));