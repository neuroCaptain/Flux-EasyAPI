
function fetchAPIHealthStatus() {
    const statusElement = document.getElementById('api-health-status');
    const statusCard = document.getElementById('api-health-status-card');

    fetch('/health')
    .then(response => response.json())
    .then(data => {        
        if (data.status === "ok") {
            statusElement.innerText = "Healthy";
            statusCard.className = 'card text-white bg-success p-2 shadow';
        } else {
            statusElement.innerText = "Unhealthy";
            statusCard.className = 'card text-white bg-danger p-2 shadow';
        }
    })
    .catch(error => {
        console.error('Error fetching API health status:', error);
        statusElement.innerText = "Unhealthy";
        statusCard.className = 'card text-white bg-danger p-2 shadow';
    });
}

setInterval(fetchAPIHealthStatus, 5000);

fetchAPIHealthStatus();