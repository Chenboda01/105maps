// 105maps - Simple Digital Maps
// Main JavaScript file for map functionality

class MapApp {
    constructor() {
        this.mapContainer = document.getElementById('map');
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');

        // Initialize map properties
        this.scale = 1;
        this.maxScale = 3;
        this.minScale = 0.5;
        this.position = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        // Mobile-specific properties
        this.lastTouchDistance = 0;
        this.isPinching = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.drawMap();

        // Add resize listener for mobile orientation changes
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.drawMap();
            }, 300);
        });
    }

    setupEventListeners() {
        // Search functionality
        this.searchBtn.addEventListener('click', () => this.searchLocation());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation();
            }
        });

        // Zoom controls
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());

        // Panning functionality
        this.mapContainer.addEventListener('mousedown', (e) => this.startDrag(e));
        this.mapContainer.addEventListener('mousemove', (e) => this.drag(e));
        this.mapContainer.addEventListener('mouseup', () => this.endDrag());
        this.mapContainer.addEventListener('mouseleave', () => this.endDrag());

        // Touch events for mobile
        this.mapContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.mapContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.mapContainer.addEventListener('touchend', () => this.handleTouchEnd(e));
    }

    handleTouchStart(e) {
        if (e.touches.length === 1) {
            // Single touch - start drag
            this.startDrag(e.touches[0]);
        } else if (e.touches.length === 2) {
            // Two touches - start pinch to zoom
            this.isPinching = true;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            this.lastTouchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );
        }
    }

    handleTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 1 && !this.isPinching) {
            // Single touch - drag
            this.drag(e.touches[0]);
        } else if (e.touches.length === 2) {
            // Two touches - pinch to zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentTouchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            );

            if (this.lastTouchDistance) {
                const scaleChange = currentTouchDistance / this.lastTouchDistance;

                // Calculate center point between the two touches
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;

                // Apply zoom
                const oldScale = this.scale;
                this.scale = Math.min(Math.max(this.minScale, this.scale * scaleChange), this.maxScale);
                const finalScaleChange = this.scale / oldScale;

                // Adjust position to zoom towards pinch center
                this.position.x = centerX - (centerX - this.position.x) * finalScaleChange;
                this.position.y = centerY - (centerY - this.position.y) * finalScaleChange;

                this.drawMap();
            }

            this.lastTouchDistance = currentTouchDistance;
        }
    }

    handleTouchEnd(e) {
        if (e.touches.length < 2) {
            this.isPinching = false;
        }

        if (e.touches.length === 0) {
            this.endDrag();
        }
    }

    drawMap() {
        // Use requestAnimationFrame for better performance
        if (this.drawMapTimeout) {
            cancelAnimationFrame(this.drawMapTimeout);
        }

        this.drawMapTimeout = requestAnimationFrame(() => {
            // Clear the map container
            this.mapContainer.innerHTML = '';

            // Create a simple grid pattern to represent the map
            const gridSize = 50;
            const width = this.mapContainer.clientWidth;
            const height = this.mapContainer.clientHeight;

            // Apply scaling and positioning
            const scaledWidth = width * this.scale;
            const scaledHeight = height * this.scale;

            const mapCanvas = document.createElement('div');
            mapCanvas.style.width = `${scaledWidth}px`;
            mapCanvas.style.height = `${scaledHeight}px`;
            mapCanvas.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
            mapCanvas.style.backgroundImage = `
                linear-gradient(#f0f0f0 1px, transparent 1px),
                linear-gradient(90deg, #f0f0f0 1px, transparent 1px)
            `;
            mapCanvas.style.backgroundSize = `${gridSize}px ${gridSize}px`;
            mapCanvas.style.position = 'relative';
            mapCanvas.style.left = '0';
            mapCanvas.style.top = '0';
            mapCanvas.style.touchAction = 'none'; // Prevent default touch actions on the map

            // Add some sample location markers
            this.addSampleMarkers(mapCanvas);

            this.mapContainer.appendChild(mapCanvas);
        });
    }

    addSampleMarkers(container) {
        // Add some sample location markers
        const locations = [
            { x: 100, y: 100, name: 'Sample Location 1' },
            { x: 300, y: 200, name: 'Sample Location 2' },
            { x: 500, y: 150, name: 'Sample Location 3' }
        ];

        locations.forEach(loc => {
            const marker = document.createElement('div');
            marker.className = 'marker';
            marker.style.position = 'absolute';
            marker.style.left = `${loc.x}px`;
            marker.style.top = `${loc.y}px`;
            marker.style.width = '10px';
            marker.style.height = '10px';
            marker.style.backgroundColor = '#ff0000';
            marker.style.borderRadius = '50%';
            marker.style.border = '2px solid #fff';
            marker.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
            marker.title = loc.name;
            marker.style.touchAction = 'auto'; // Allow touch events on markers
            container.appendChild(marker);
        });
    }

    zoomIn() {
        if (this.scale < this.maxScale) {
            // Calculate the center point of the current view
            const centerX = this.mapContainer.clientWidth / 2;
            const centerY = this.mapContainer.clientHeight / 2;

            // Store the current scale for calculations
            const oldScale = this.scale;
            this.scale = Math.min(this.maxScale, this.scale + 0.25);
            const scaleChange = this.scale / oldScale;

            // Adjust position to zoom towards center
            this.position.x = centerX - (centerX - this.position.x) * scaleChange;
            this.position.y = centerY - (centerY - this.position.y) * scaleChange;

            this.drawMap();
        }
    }

    zoomOut() {
        if (this.scale > this.minScale) {
            // Calculate the center point of the current view
            const centerX = this.mapContainer.clientWidth / 2;
            const centerY = this.mapContainer.clientHeight / 2;

            // Store the current scale for calculations
            const oldScale = this.scale;
            this.scale = Math.max(this.minScale, this.scale - 0.25);
            const scaleChange = this.scale / oldScale;

            // Adjust position to zoom towards center
            this.position.x = centerX - (centerX - this.position.x) * scaleChange;
            this.position.y = centerY - (centerY - this.position.y) * scaleChange;

            this.drawMap();
        }
    }

    startDrag(e) {
        this.isDragging = true;
        this.dragStart.x = e.clientX - this.position.x;
        this.dragStart.y = e.clientY - this.position.y;
        this.mapContainer.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;

        this.position.x = e.clientX - this.dragStart.x;
        this.position.y = e.clientY - this.dragStart.y;

        // Keep the map within bounds (prevent dragging too far)
        const maxLeft = this.mapContainer.clientWidth * (1 - this.scale);
        const maxTop = this.mapContainer.clientHeight * (1 - this.scale);

        this.position.x = Math.max(maxLeft, Math.min(0, this.position.x));
        this.position.y = Math.max(maxTop, Math.min(0, this.position.y));

        this.drawMap();
    }

    endDrag() {
        this.isDragging = false;
        this.mapContainer.style.cursor = 'grab';
    }

    // Performance optimization: Cleanup method
    destroy() {
        // Cancel any pending animation frames
        if (this.drawMapTimeout) {
            cancelAnimationFrame(this.drawMapTimeout);
        }

        // Remove event listeners to prevent memory leaks
        this.mapContainer.removeEventListener('mousedown', this.startDrag);
        this.mapContainer.removeEventListener('mousemove', this.drag);
        this.mapContainer.removeEventListener('mouseup', this.endDrag);
        this.mapContainer.removeEventListener('mouseleave', this.endDrag);
        this.mapContainer.removeEventListener('touchstart', this.handleTouchStart);
        this.mapContainer.removeEventListener('touchmove', this.handleTouchMove);
        this.mapContainer.removeEventListener('touchend', this.handleTouchEnd);
    }

    async searchLocation() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        try {
            // Show loading state
            this.searchBtn.textContent = '...';
            this.searchBtn.disabled = true;

            // Call the backend API to search for the location
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Handle multiple results
            if (data.results && data.results.length > 0) {
                // Show multiple results
                if (data.results.length === 1) {
                    // Single result
                    const location = data.results[0];
                    this.handleLocationResult(location);
                } else {
                    // Multiple results - show selection UI
                    this.showSearchResults(data.results);
                }
            } else if (data.lat !== 0 || data.lng !== 0) {
                // Single result in old format
                this.handleLocationResult(data);
            } else {
                // No results - show suggestions if available
                if (data.suggestions && data.suggestions.length > 0) {
                    this.showSuggestions(data.suggestions, query);
                } else {
                    alert(data.message || `Location not found: ${query}`);
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            alert(`Error searching for location: ${error.message}`);
        } finally {
            // Restore button state
            this.searchBtn.textContent = 'Search';
            this.searchBtn.disabled = false;
        }
    }

    handleLocationResult(location) {
        // For now, we'll just log the result since our visual map doesn't use lat/lng yet
        console.log(`Found location: ${location.name} at (${location.lat}, ${location.lng})`);

        // In a real implementation, we would center the map on the coordinates
        // For our current grid-based map, we'll just show a success message
        if (window.capacitor) {
            // Running as native app
            alert(`Location found: ${location.name}`);
        } else {
            // Running as web app
            alert(`Location found: ${location.name}`);
        }

        // Move the map view to simulate centering (in a simple way)
        this.position.x = -location.lng * 10;
        this.position.y = -location.lat * 10;
        this.drawMap();
    }

    showSearchResults(results) {
        // Create a modal or dropdown to show search results
        let resultHtml = '<div class="search-results-modal"><h3>Search Results:</h3><ul>';
        results.forEach((location, index) => {
            resultHtml += `<li data-index="${index}" class="search-result-item" style="padding: 8px; cursor: pointer; border-bottom: 1px solid #ccc;">${location.name}</li>`;
        });
        resultHtml += '</ul></div>';

        // Create modal element
        const modal = document.createElement('div');
        modal.innerHTML = resultHtml;
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.border = '1px solid #ccc';
        modal.style.borderRadius = '5px';
        modal.style.zIndex = '1000';
        modal.style.maxHeight = '300px';
        modal.style.overflowY = 'auto';
        modal.className = 'search-results-modal';

        // Add close functionality
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '5px';
        closeBtn.style.right = '5px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        modal.appendChild(closeBtn);

        // Add event listeners to result items
        const resultItems = modal.querySelectorAll('.search-result-item');
        resultItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.handleLocationResult(results[index]);
                document.body.removeChild(modal);
            });
        });

        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '999';
        overlay.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        });

        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }

    showSuggestions(suggestions, query) {
        // Show suggestions when no exact match is found
        let suggestionHtml = `<div class="suggestions-modal"><h3>Suggestions for "${query}":</h3><ul>`;
        suggestions.forEach((location, index) => {
            suggestionHtml += `<li data-index="${index}" class="suggestion-item" style="padding: 8px; cursor: pointer; border-bottom: 1px solid #ccc;">${location.name}</li>`;
        });
        suggestionHtml += '</ul></div>';

        // Create modal element
        const modal = document.createElement('div');
        modal.innerHTML = suggestionHtml;
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.border = '1px solid #ccc';
        modal.style.borderRadius = '5px';
        modal.style.zIndex = '1000';
        modal.style.maxHeight = '300px';
        modal.style.overflowY = 'auto';
        modal.className = 'suggestions-modal';

        // Add close functionality
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '5px';
        closeBtn.style.right = '5px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        modal.appendChild(closeBtn);

        // Add event listeners to suggestion items
        const suggestionItems = modal.querySelectorAll('.suggestion-item');
        suggestionItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.handleLocationResult(suggestions[index]);
                document.body.removeChild(modal);
            });
        });

        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '999';
        overlay.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        });

        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }
}

class TutorialManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.tutorialOverlay = document.getElementById('tutorial-overlay');
        this.prevBtn = document.getElementById('prev-tutorial');
        this.nextBtn = document.getElementById('next-tutorial');
        this.closeBtn = document.getElementById('close-tutorial');
        this.progressSpan = document.getElementById('tutorial-progress');

        this.init();
    }

    init() {
        // Check if user has already seen the tutorial
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            this.showTutorial();
            localStorage.setItem('hasSeenTutorial', 'true');
        }

        // Set up event listeners
        this.prevBtn.addEventListener('click', () => this.previousStep());
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.closeBtn.addEventListener('click', () => this.closeTutorial());

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.tutorialOverlay.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft') {
                    this.previousStep();
                } else if (e.key === 'ArrowRight' || e.key === ' ') {
                    this.nextStep();
                } else if (e.key === 'Escape') {
                    this.closeTutorial();
                }
            }
        });
    }

    showTutorial() {
        this.tutorialOverlay.classList.remove('hidden');
        this.updateTutorialView();
    }

    closeTutorial() {
        this.tutorialOverlay.classList.add('hidden');
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateTutorialView();
        } else {
            this.closeTutorial();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateTutorialView();
        }
    }

    updateTutorialView() {
        // Use requestAnimationFrame for better performance
        if (this.tutorialUpdateTimeout) {
            cancelAnimationFrame(this.tutorialUpdateTimeout);
        }

        this.tutorialUpdateTimeout = requestAnimationFrame(() => {
            // Hide all steps
            document.querySelectorAll('.tutorial-step').forEach(step => {
                step.classList.add('hidden');
            });

            // Show current step
            const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
            if (currentStepElement) {
                currentStepElement.classList.remove('hidden');
                currentStepElement.classList.add('active');
            }

            // Update progress text
            this.progressSpan.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;

            // Update button states
            this.prevBtn.disabled = (this.currentStep === 1);
            this.nextBtn.textContent = (this.currentStep === this.totalSteps) ? 'Finish' : 'Next';
        });
    }

    // Cleanup method for performance
    destroy() {
        if (this.tutorialUpdateTimeout) {
            cancelAnimationFrame(this.tutorialUpdateTimeout);
        }
    }
}

// Initialize the map application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const mapApp = new MapApp();

    // Initialize tutorial manager
    const tutorialManager = new TutorialManager();

    // Add event listener for the help button
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            tutorialManager.currentStep = 1; // Reset to first step
            tutorialManager.showTutorial();
        });
    }

    // Initialize feedback manager
    const feedbackManager = new FeedbackManager();

    // Add event listener for the feedback button
    const feedbackBtn = document.getElementById('feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            feedbackManager.showFeedback();
        });
    }

    // Handle page unload to cleanup resources
    window.addEventListener('beforeunload', () => {
        if (mapApp && typeof mapApp.destroy === 'function') {
            mapApp.destroy();
        }
        if (tutorialManager && typeof tutorialManager.destroy === 'function') {
            tutorialManager.destroy();
        }
        if (feedbackManager && typeof feedbackManager.destroy === 'function') {
            feedbackManager.destroy();
        }
    });
});

class FeedbackManager {
    constructor() {
        this.feedbackOverlay = document.getElementById('feedback-overlay');
        this.feedbackForm = document.getElementById('feedback-form');
        this.cancelBtn = document.getElementById('cancel-feedback');
        this.submitBtn = document.getElementById('submit-feedback');
        this.deviceInfoField = document.getElementById('feedback-device');

        this.init();
    }

    init() {
        // Populate device information
        this.populateDeviceInfo();

        // Set up event listeners
        this.cancelBtn.addEventListener('click', () => this.closeFeedback());
        this.submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });
        this.feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.feedbackOverlay.classList.contains('hidden')) {
                if (e.key === 'Escape') {
                    this.closeFeedback();
                }
            }
        });
    }

    populateDeviceInfo() {
        const deviceInfo = `Browser: ${navigator.userAgent}
Platform: ${navigator.platform}
Language: ${navigator.language}
Screen: ${screen.width}x${screen.height}
Online: ${navigator.onLine ? 'Yes' : 'No'}`;

        this.deviceInfoField.value = deviceInfo;
    }

    showFeedback() {
        // Reset form
        this.feedbackForm.reset();

        // Show overlay
        this.feedbackOverlay.classList.remove('hidden');

        // Focus on the first input
        document.getElementById('feedback-type').focus();
    }

    closeFeedback() {
        this.feedbackOverlay.classList.add('hidden');
    }

    async submitFeedback() {
        const feedbackType = document.getElementById('feedback-type').value;
        const email = document.getElementById('feedback-email').value;
        const message = document.getElementById('feedback-message').value;
        const deviceInfo = this.deviceInfoField.value;

        // Validate required fields
        if (!feedbackType || !message) {
            alert('Please fill in all required fields.');
            return;
        }

        // Disable submit button to prevent duplicate submissions
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Sending...';

        try {
            // Send feedback to backend
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: feedbackType,
                    email: email || null,
                    message: message,
                    deviceInfo: deviceInfo
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Thank you for your feedback! We appreciate your input.');
                this.closeFeedback();
            } else {
                throw new Error(result.error || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            alert(`Error submitting feedback: ${error.message}`);
        } finally {
            // Re-enable submit button
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = 'Submit';
        }
    }

    // Cleanup method for performance
    destroy() {
        // Remove event listeners to prevent memory leaks
        this.cancelBtn.removeEventListener('click', this.closeFeedback);
        this.submitBtn.removeEventListener('click', this.submitFeedback);
        this.feedbackForm.removeEventListener('submit', this.submitFeedback);
    }
}