"""
105maps - Simple Digital Maps
Backend server using Python and Flask
"""

from flask import Flask, request, jsonify, send_from_directory
import json
import os

app = Flask(__name__, static_folder='.')

# Sample data for locations (in a real app, this would come from a database)
sample_locations = {
    "new york": {"lat": 40.7128, "lng": -74.0060, "name": "New York, USA"},
    "london": {"lat": 51.5074, "lng": -0.1278, "name": "London, UK"},
    "tokyo": {"lat": 35.6895, "lng": 139.6917, "name": "Tokyo, Japan"},
    "paris": {"lat": 48.8566, "lng": 2.3522, "name": "Paris, France"},
    "sydney": {"lat": -33.8688, "lng": 151.2093, "name": "Sydney, Australia"},
    "beijing": {"lat": 39.9042, "lng": 116.4074, "name": "Beijing, China"},
    "moscow": {"lat": 55.7558, "lng": 37.6173, "name": "Moscow, Russia"},
    "cairo": {"lat": 30.0444, "lng": 31.2357, "name": "Cairo, Egypt"},
    "rio": {"lat": -22.9068, "lng": -43.1729, "name": "Rio de Janeiro, Brazil"},
    "cape town": {"lat": -33.9249, "lng": 18.4241, "name": "Cape Town, South Africa"},
    "seoul": {"lat": 37.5665, "lng": 126.9780, "name": "Seoul, South Korea"},
    "toronto": {"lat": 43.6532, "lng": -79.3832, "name": "Toronto, Canada"},
    "los angeles": {"lat": 34.0522, "lng": -118.2437, "name": "Los Angeles, USA"},
    "chicago": {"lat": 41.8781, "lng": -87.6298, "name": "Chicago, USA"},
    "mexico city": {"lat": 19.4326, "lng": -99.1332, "name": "Mexico City, Mexico"},
    "mumbai": {"lat": 19.0760, "lng": 72.8777, "name": "Mumbai, India"},
    "shanghai": {"lat": 31.2304, "lng": 121.4737, "name": "Shanghai, China"},
    "dubai": {"lat": 25.2048, "lng": 55.2708, "name": "Dubai, UAE"},
    "singapore": {"lat": 1.3521, "lng": 103.8198, "name": "Singapore"},
    "hong kong": {"lat": 22.3193, "lng": 114.1694, "name": "Hong Kong"},
    "berlin": {"lat": 52.5200, "lng": 13.4050, "name": "Berlin, Germany"},
    "rome": {"lat": 41.9028, "lng": 12.4964, "name": "Rome, Italy"},
    "amsterdam": {"lat": 52.3676, "lng": 4.9041, "name": "Amsterdam, Netherlands"},
    "vienna": {"lat": 48.2082, "lng": 16.3738, "name": "Vienna, Austria"}
}

@app.route('/')
def index():
    """Serve the main page"""
    response = send_from_directory('.', 'index.html')
    response.headers['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
    return response

@app.route('/css/<path:path>')
def send_css(path):
    """Serve CSS files"""
    response = send_from_directory('css', path)
    response.headers['Cache-Control'] = 'public, max-age=86400'  # Cache for 1 day
    return response

@app.route('/js/<path:path>')
def send_js(path):
    """Serve JavaScript files"""
    response = send_from_directory('js', path)
    response.headers['Cache-Control'] = 'public, max-age=86400'  # Cache for 1 day
    return response

@app.route('/assets/<path:path>')
def send_assets(path):
    """Serve asset files"""
    response = send_from_directory('assets', path)
    response.headers['Cache-Control'] = 'public, max-age=86400'  # Cache for 1 day
    return response

@app.route('/api/search', methods=['GET'])
def search_location():
    """
    Search for a location
    Example: /api/search?q=Paris
    """
    query = request.args.get('q', '').lower().strip()

    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400

    # Exact match first
    for location_name, coords in sample_locations.items():
        if query == location_name:
            return jsonify({
                "name": coords["name"],
                "lat": coords["lat"],
                "lng": coords["lng"]
            })

    # Partial match with fuzzy search
    matches = []
    for location_name, coords in sample_locations.items():
        if query in location_name or location_name in query:
            matches.append({
                "name": coords["name"],
                "lat": coords["lat"],
                "lng": coords["lng"],
                "match_type": "partial"
            })

    # If we have matches, return the best ones
    if matches:
        return jsonify({"results": matches, "total": len(matches)})

    # If not found in sample data, return a mock response
    # In a real implementation, you would call a geocoding service
    return jsonify({
        "name": query,
        "lat": 0,
        "lng": 0,
        "message": "Location not found in sample data. In a real implementation, this would call a geocoding service.",
        "suggestions": get_suggestions(query)
    })

def get_suggestions(query):
    """
    Provide location suggestions based on partial matches
    """
    suggestions = []
    for location_name, coords in sample_locations.items():
        if query in location_name:
            suggestions.append({
                "name": coords["name"],
                "lat": coords["lat"],
                "lng": coords["lng"]
            })
    return suggestions[:5]  # Return top 5 suggestions

@app.route('/api/geocode', methods=['POST'])
def geocode_location():
    """
    Geocode a location (convert address to coordinates)
    """
    data = request.get_json()
    address = data.get('address', '').lower().strip()

    if not address:
        return jsonify({"error": "Address is required"}), 400

    # Simple lookup in our sample data
    for location_name, coords in sample_locations.items():
        if address in location_name:
            return jsonify({
                "address": coords["name"],
                "lat": coords["lat"],
                "lng": coords["lng"]
            })

    # If not found, return mock coordinates
    return jsonify({
        "address": address,
        "lat": 0,
        "lng": 0,
        "message": "Address not found in sample data."
    })

@app.route('/api/reverse-geocode', methods=['GET'])
def reverse_geocode():
    """
    Reverse geocode - convert coordinates to address
    Example: /api/reverse-geocode?lat=40.7128&lng=-74.0060
    """
    try:
        lat = float(request.args.get('lat', 0))
        lng = float(request.args.get('lng', 0))
    except ValueError:
        return jsonify({"error": "Invalid latitude or longitude"}), 400

    # Find the closest location in our sample data
    closest_location = None
    min_distance = float('inf')

    for location_name, coords in sample_locations.items():
        distance = ((coords["lat"] - lat)**2 + (coords["lng"] - lng)**2)**0.5
        if distance < min_distance:
            min_distance = distance
            closest_location = coords

    if closest_location and min_distance < 5:  # Threshold for "close enough"
        return jsonify({
            "name": closest_location["name"],
            "lat": closest_location["lat"],
            "lng": closest_location["lng"],
            "distance": min_distance
        })

    return jsonify({
        "lat": lat,
        "lng": lng,
        "message": "No location found near these coordinates in sample data."
    })

@app.route('/api/directions', methods=['GET'])
def get_directions():
    """
    Get directions between two points
    Example: /api/directions?from=New York&to=London
    """
    start = request.args.get('from', '').lower().strip()
    end = request.args.get('to', '').lower().strip()

    if not start or not end:
        return jsonify({"error": "Both 'from' and 'to' parameters are required"}), 400

    # Find start and end locations
    start_location = None
    end_location = None

    for location_name, coords in sample_locations.items():
        if start in location_name:
            start_location = coords
            break

    for location_name, coords in sample_locations.items():
        if end in location_name:
            end_location = coords
            break

    if not start_location or not end_location:
        return jsonify({
            "error": "One or both locations not found",
            "message": "Could not find both start and end locations in sample data"
        }), 404

    # Calculate simple distance (in a real app, this would be more complex)
    distance = ((start_location["lat"] - end_location["lat"])**2 +
                (start_location["lng"] - end_location["lng"])**2)**0.5

    # Return mock directions
    return jsonify({
        "start": start_location["name"],
        "end": end_location["name"],
        "distance_km": round(distance * 100, 2),  # Rough conversion
        "estimated_time_hours": round(distance * 100 / 80, 2),  # Assuming 80km/h average
        "steps": [
            f"Start at {start_location['name']}",
            "Travel in a straight line toward destination",
            f"Arrive at {end_location['name']}"
        ]
    })

@app.route('/api/popular-locations', methods=['GET'])
def popular_locations():
    """
    Get a list of popular locations
    """
    locations_list = []
    for location_name, coords in sample_locations.items():
        locations_list.append({
            "name": coords["name"],
            "lat": coords["lat"],
            "lng": coords["lng"]
        })

    return jsonify({
        "locations": locations_list,
        "count": len(locations_list)
    })

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """
    Submit feedback from users
    """
    data = request.get_json()

    # Validate required fields
    if not data or 'type' not in data or 'message' not in data:
        return jsonify({"error": "Missing required fields: type and message"}), 400

    feedback_type = data.get('type')
    message = data.get('message')
    email = data.get('email')
    device_info = data.get('device_info', '')

    # Validate feedback type
    valid_types = ['bug', 'feature', 'general', 'support']
    if feedback_type not in valid_types:
        return jsonify({"error": f"Invalid feedback type. Must be one of: {', '.join(valid_types)}"}), 400

    # In a real application, you would save this feedback to a database
    # For now, we'll just log it
    print(f"New feedback received:")
    print(f"  Type: {feedback_type}")
    print(f"  Email: {email}")
    print(f"  Message: {message}")
    print(f"  Device Info: {device_info}")
    print("-" * 50)

    # In a real application, you might also send an email notification
    # or save to a database here

    return jsonify({
        "message": "Feedback received successfully",
        "feedback_id": "temp_id_" + str(hash(message))  # In a real app, use a proper ID
    })

if __name__ == '__main__':
    # Check if Flask is installed
    try:
        import flask
    except ImportError:
        print("Flask is not installed. Please install it using 'pip install flask'")
        exit(1)

    print("Starting 105maps server...")
    print("Visit http://localhost:5000 to view the map")
    print("API endpoints available:")
    print("  - GET /api/search?q=location_name")
    print("  - POST /api/geocode {\"address\": \"location_name\"}")
    print("  - GET /api/reverse-geocode?lat=XX&lng=YY")
    print("  - GET /api/directions?from=start&to=end")
    print("  - GET /api/popular-locations")
    print("  - POST /api/feedback {\"type\": \"bug|feature|general|support\", \"message\": \"...\", \"email\": \"...\"}")
    app.run(debug=True, host='0.0.0.0', port=5000)