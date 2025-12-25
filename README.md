# 105maps - Simple Digital Maps

105maps is a digital maps similar to Google Maps, but with a focus on simplicity and ease of use. It provides basic mapping features such as zooming, panning, and location search without the complexity of advanced functionalities. You can use 105maps for quick navigation and location finding.

## Technology Stack

The project uses:
- **Frontend**: JavaScript for map interface and interactions
- **Backend**: Python (Flask) for API services and data processing
- A mixture of both technologies creates a comprehensive mapping solution

## Features

- Interactive map with zoom and panning
- Location search functionality
- Responsive design for different screen sizes
- Clean and simple user interface
- API endpoints for geocoding, reverse geocoding, and directions

## Repository

This is the official repository for the 105maps project.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Chenboda01/105maps.git
   ```

2. Navigate to the src directory:
   ```bash
   cd 105maps/src
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

To start the development server:

```bash
cd 105maps/src
python server.py
```

Then visit `http://localhost:5000` in your browser to run the application.

## API Endpoints

- `GET /api/search?q=location_name` - Search for a location
- `POST /api/geocode` - Convert address to coordinates
- `GET /api/reverse-geocode?lat=XX&lng=YY` - Convert coordinates to address
- `GET /api/directions?from=start&to=end` - Get directions between two points
- `GET /api/popular-locations` - Get a list of popular locations

Feel free to explore the code, contribute, or report issues. Happy mapping!
