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
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.drawMap();
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
        this.mapContainer.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        this.mapContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.drag(e.touches[0]);
        });
        this.mapContainer.addEventListener('touchend', () => this.endDrag());
    }
    
    drawMap() {
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
        
        // Add some sample location markers
        this.addSampleMarkers(mapCanvas);
        
        this.mapContainer.appendChild(mapCanvas);
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

            // If location is found, center the map on it
            if (data.lat !== 0 || data.lng !== 0) {
                // For now, we'll just log the result since our visual map doesn't use lat/lng yet
                console.log(`Found location: ${data.name} at (${data.lat}, ${data.lng})`);

                // In a real implementation, we would center the map on the coordinates
                // For our current grid-based map, we'll just show a success message
                alert(`Location found: ${data.name}`);

                // Move the map view to simulate centering (in a simple way)
                this.position.x = -data.lng * 10;
                this.position.y = -data.lat * 10;
                this.drawMap();
            } else {
                alert(data.message || `Location not found: ${query}`);
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
}

// Initialize the map application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MapApp();
});