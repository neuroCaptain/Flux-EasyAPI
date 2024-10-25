// Function to open the lightbox
function openLightbox(lightbox) {
    lightbox.style.display = 'flex'; // Show the lightbox as a flexbox for centering
}

// Function to close the lightbox
function closeLightbox(lightbox) {
    lightbox.style.display = 'none'; // Hide the lightbox
}

// Function to add lightbox functionality to all images
function addLightboxListeners() {
    document.querySelectorAll('.lightbox-trigger').forEach(function(trigger) {
        trigger.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior
            const lightbox = this.parentElement.querySelector('.lightbox');
            openLightbox(lightbox); // Open the corresponding lightbox
        });
    });

    document.querySelectorAll('.lightbox .close').forEach(function(closeButton) {
        closeButton.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior
            const lightbox = this.closest('.lightbox');
            closeLightbox(lightbox); // Close the corresponding lightbox
        });
    });
}

// Function to handle image download
function addDownloadListeners() {
    document.querySelectorAll('.btn-outline-primary').forEach(function(button) {
        button.addEventListener('click', function() {
            const imageName = this.getAttribute('data-image-name');
            const imageUrl = `/images/${imageName}`;  // Construct the image URL

            // Create a temporary download link and trigger the download
            const downloadLink = document.createElement('a');
            downloadLink.href = imageUrl;
            downloadLink.download = imageName; // Set the download attribute with the image name
            document.body.appendChild(downloadLink); // Append the link to the document body
            downloadLink.click(); // Trigger the download
            document.body.removeChild(downloadLink); // Remove the link from the document
        });
    });
}

// Function to handle the deletion of an image
function addDeleteListeners() {
    document.querySelectorAll('.delete-image-btn').forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const imageName = this.getAttribute('data-image-name');
            const cardId = `image-card-${imageName}`;

            fetch(`/images/${imageName}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    // Remove the image card from the DOM
                    const imageCard = document.getElementById(cardId);
                    if (imageCard) {
                        imageCard.remove();
                        showAlert('Image deleted successfully.', 'success');
                    }
                    // Update the image count
                    const currentCount = parseInt(document.getElementById('image-count').innerText);
                    updateImageCount(currentCount - 1);
                } else {
                    showAlert('Error deleting the image.', 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred while deleting the image.', 'danger');
            });
        });
    });
}

// Delete all images
document.getElementById('delete-btn').addEventListener('click', function(event) {
    event.preventDefault();
    const url = event.target.getAttribute('data-url');
    fetch(url, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            showAlert('Files deleted successfully.', 'success');
            location.reload(); // Reload the page after successful deletion
        } else {
            showAlert('Error deleting files.', 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('An error occurred.', 'danger');
    });
});

// Update image count directly based on the number of images fetched from the server
function updateImageCount(newCount) {
    const imageCountElement = document.getElementById('image-count');
    imageCountElement.innerText = newCount;
}

// Polling for new images every 20 seconds
function fetchNewImages() {
    fetch('/images')
    .then(response => response.json())
    .then(data => {
        const imageGrid = document.getElementById('image-grid');
        const noImagesMessage = document.getElementById('no-images-message');
        const currentImages = Array.from(imageGrid.querySelectorAll('img')).map(img => img.getAttribute('src').split('/').pop());

        // Update the image count with the length of images from the server
        updateImageCount(data.images.length);

        data.images.forEach(image => {
            if (!currentImages.includes(image)) {
                const col = document.createElement('div');
                col.className = 'col';
                col.id = `image-card-${image}`;
                col.innerHTML = `
                    <div class="card">
                        <a href="#${image}" class="card-body text-center p-0 lightbox-trigger">
                            <img src="/images/${image}" class="card-img-top" alt="${image}" style="object-fit: contain;">
                        </a>
                        <div id="${image}" class="lightbox" style="display: none;">
                            <a href="#" class="close" style="position: absolute; top: 10px; right: 15px; color: white; font-size: 30px; text-decoration: none;">&times;</a>
                            <img src="/images/${image}" alt="${image}">
                        </div>
                        <div class="card-footer">
                            <div class="row gap-2">
                                <button class="btn btn-outline-primary col-sm" data-image-name="${image}">Download</button>
                                <button class="btn btn-outline-danger col-sm delete-image-btn" data-image-name="${image}">Delete</button>
                            </div>
                        </div>
                    </div>`;
                imageGrid.appendChild(col);
                showAlert('New image added.', 'success');

                // Remove the "No images found" message if present
                if (noImagesMessage) {
                    noImagesMessage.remove();
                }

                // Attach lightbox, download, and delete listeners for the new images
                addLightboxListeners();
                addDownloadListeners();
                addDeleteListeners();
            }
        });
    })
    .catch(error => {
        console.error('Error fetching images:', error);
        showAlert('An error occurred while fetching the images.', 'danger');
    });
}

// Polling the queue endpoint every 4 seconds
function fetchQueueStatus() {
    fetch('/queue')
    .then(response => response.json())
    .then(data => {
        document.getElementById('queue-pending').innerText = `Pending: ${data.queue_pending}`;
        document.getElementById('queue-running').innerText = `Running: ${data.queue_running}`;
    })
    .catch(error => {
        console.error('Error fetching queue status:', error);
        showAlert('An error occurred while fetching the queue status.', 'danger');
    });
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alert);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        alert.addEventListener('transitionend', () => alert.remove());
    }, 2500);
}


const fetchQueueInterval = 20000; // Polling interval for queue and images

// Start polling for new images and queue status
setInterval(fetchNewImages, fetchQueueInterval);
setInterval(fetchQueueStatus, fetchQueueInterval);

// Initial call to populate queue status and images immediately
fetchQueueStatus();
fetchNewImages();

// Attach lightbox, download, and delete functionality to initially loaded images
addLightboxListeners();
addDownloadListeners();
addDeleteListeners();
