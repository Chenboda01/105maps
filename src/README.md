# 105maps - Simple Digital Maps

This is a simple digital maps application similar to Google Maps, with a focus on simplicity and ease of use. It provides basic mapping features such as zooming, panning, and location search.

## Features

- Interactive map with zoom and panning
- Location search functionality
- Responsive design for different screen sizes
- Clean and simple user interface

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python (Flask)

## Installation

1. Navigate to the src directory:
   ```bash
   cd /home/bodachen/105maps/src
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

To start the development server:

```bash
cd /home/bodachen/105maps/src
python server.py
```

Then visit `http://localhost:5000` in your browser to run the local implementation.

## API Endpoints

- `GET /api/search?q=location_name` - Search for a location
- `POST /api/geocode` - Convert address to coordinates
- `GET /api/reverse-geocode?lat=XX&lng=YY` - Convert coordinates to address
- `GET /api/directions?from=start&to=end` - Get directions between two points
- `GET /api/popular-locations` - Get a list of popular locations

## Project Structure

```
src/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Stylesheet
├── js/
│   └── map.js          # JavaScript functionality
├── server.py           # Python Flask server
├── requirements.txt    # Python dependencies
└── README.md          # This file
```