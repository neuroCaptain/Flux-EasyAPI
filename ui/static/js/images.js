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
        button.addEventListener('click', function() {
            const imageName = this.getAttribute('data-image-name');
            const cardId = `image-card-${imageName}`;

            if (confirm(`Are you sure you want to delete image "${imageName}"?`)) {
                fetch(`/images/${imageName}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (response.ok) {
                        // Remove the image card from the DOM
                        const imageCard = document.getElementById(cardId);
                        if (imageCard) {
                            imageCard.remove();
                        }
                        // Update the image count
                        const currentCount = parseInt(document.getElementById('image-count').innerText);
                        updateImageCount(currentCount - 1);
                    } else {
                        alert('Error deleting the image.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while deleting the image.');
                });
            }
        });
    });
}

// Delete all images
document.getElementById('delete-btn').addEventListener('click', function(event) {
    event.preventDefault();
    const url = event.target.getAttribute('data-url');
    if (confirm("Are you sure you want to delete all files?")) {
        fetch(url, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                alert('Files deleted successfully.');
                location.reload(); // Reload the page after successful deletion
            } else {
                alert('Error deleting files.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred.');
        });
    }
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
    });
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
