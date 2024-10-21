    // Function to fetch API health status and update the UI
    function fetchAPIHealthStatus() {
        fetch('/health')
        .then(response => response.json())
        .then(data => {
            const statusElement = document.getElementById('api-health-status');
            const statusCard = document.getElementById('api-health-status-card');
            if (data.status === "ok") {
                statusElement.innerText = "Healthy";
                statusCard.classList.add('bg-success');
            } else {
                statusElement.innerText = "Unhealthy";
                statusCard.classList.add('bg-danger');
            }
        })
        .catch(error => {
            console.error('Error fetching API health status:', error);
            const statusElement = document.getElementById('api-health-status');
            const statusCard = document.getElementById('api-health-status-card');
            statusElement.innerText = "Unhealthy";
            statusCard.classList.add('bg-danger');
        });
    }

    // Poll API health status every 5 seconds
    setInterval(fetchAPIHealthStatus, 5000);

    // Initial call to populate the API health status on page load
    fetchAPIHealthStatus();