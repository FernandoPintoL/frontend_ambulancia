// @ts-nocheck
/**
 * Google Maps Service
 * Handles all Google Maps API operations for incident location mapping
 */

interface Location {
  lat: number;
  lng: number;
}

interface RouteStep {
  location: Location;
  timestamp?: string;
}

interface PlaceDetails {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface DistanceMatrixResult {
  distance: string;
  duration: string;
  meters: number;
  seconds: number;
}

class GoogleMapsService {
  private apiKey: string;
  private geocodingCache: Map<string, Location> = new Map();
  private reverseGeocodingCache: Map<string, string> = new Map();

  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google API Key not configured. Set REACT_APP_GOOGLE_API_KEY environment variable.');
    }
  }

  /**
   * Calculate distance between two locations
   * @param origin Starting location
   * @param destination Ending location
   * @returns Distance in meters and kilometers
   */
  public calculateDistance(origin: Location, destination: Location): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (destination.lat - origin.lat) * (Math.PI / 180);
    const dLng = (destination.lng - origin.lng) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(origin.lat * (Math.PI / 180)) *
        Math.cos(destination.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return distance * 1000; // Return in meters
  }

  /**
   * Calculate distance between multiple waypoints
   * @param route Array of locations in order
   * @returns Total distance in meters
   */
  public calculateRouteDistance(route: Location[]): number {
    if (route.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += this.calculateDistance(route[i], route[i + 1]);
    }
    return totalDistance;
  }

  /**
   * Get center point of multiple locations
   * @param locations Array of locations
   * @returns Center location
   */
  public getCenterLocation(locations: Location[]): Location {
    if (locations.length === 0) {
      return { lat: 0, lng: 0 };
    }

    if (locations.length === 1) {
      return locations[0];
    }

    let sumLat = 0;
    let sumLng = 0;

    locations.forEach((loc) => {
      sumLat += loc.lat;
      sumLng += loc.lng;
    });

    return {
      lat: sumLat / locations.length,
      lng: sumLng / locations.length,
    };
  }

  /**
   * Get bounds that contain all locations
   * @param locations Array of locations
   * @returns Bounds object with NE and SW corners
   */
  public getBounds(locations: Location[]) {
    if (locations.length === 0) {
      return { ne: { lat: 0, lng: 0 }, sw: { lat: 0, lng: 0 } };
    }

    let minLat = locations[0].lat;
    let maxLat = locations[0].lat;
    let minLng = locations[0].lng;
    let maxLng = locations[0].lng;

    locations.forEach((loc) => {
      minLat = Math.min(minLat, loc.lat);
      maxLat = Math.max(maxLat, loc.lat);
      minLng = Math.min(minLng, loc.lng);
      maxLng = Math.max(maxLng, loc.lng);
    });

    return {
      ne: { lat: maxLat, lng: maxLng },
      sw: { lat: minLat, lng: minLng },
    };
  }

  /**
   * Format distance in human readable format
   * @param meters Distance in meters
   * @returns Formatted string (e.g., "2.5 km" or "350 m")
   */
  public formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  }

  /**
   * Generate URL for Google Static Maps (for static map images)
   * @param center Center location
   * @param markers Array of marker locations
   * @param zoom Zoom level
   * @param size Map size in pixels
   * @returns Google Static Maps URL
   */
  public getStaticMapUrl(
    center: Location,
    markers: Location[] = [],
    zoom: number = 15,
    size: string = '400x300'
  ): string {
    if (!this.apiKey) {
      return '';
    }

    let url = `https://maps.googleapis.com/maps/api/staticmap?`;
    url += `center=${center.lat},${center.lng}`;
    url += `&zoom=${zoom}`;
    url += `&size=${size}`;
    url += `&key=${this.apiKey}`;

    // Add markers
    markers.forEach((marker, index) => {
      const color = index === 0 ? 'red' : index === markers.length - 1 ? 'green' : 'blue';
      url += `&markers=color:${color}%7C${marker.lat},${marker.lng}`;
    });

    return url;
  }

  /**
   * Generate URL for directions between two points
   * @param origin Starting location
   * @param destination Ending location
   * @param travelMode Travel mode (DRIVING, WALKING, TRANSIT, BICYCLING)
   * @returns Google Maps URL for directions
   */
  public getDirectionsUrl(
    origin: Location,
    destination: Location,
    travelMode: 'DRIVING' | 'WALKING' | 'TRANSIT' | 'BICYCLING' = 'DRIVING'
  ): string {
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}&travelmode=${travelMode.toLowerCase()}`;
  }

  /**
   * Check if a location is within bounds
   * @param location Location to check
   * @param bounds Bounds object with ne and sw
   * @returns Boolean indicating if location is within bounds
   */
  public isWithinBounds(location: Location, bounds: { ne: Location; sw: Location }): boolean {
    return (
      location.lat >= bounds.sw.lat &&
      location.lat <= bounds.ne.lat &&
      location.lng >= bounds.sw.lng &&
      location.lng <= bounds.ne.lng
    );
  }

  /**
   * Add padding to bounds
   * @param bounds Original bounds
   * @param paddingPercent Percentage of padding (0-100)
   * @returns Padded bounds
   */
  public padBounds(bounds: { ne: Location; sw: Location }, paddingPercent: number = 10) {
    const latDiff = bounds.ne.lat - bounds.sw.lat;
    const lngDiff = bounds.ne.lng - bounds.sw.lng;

    const latPadding = (latDiff * paddingPercent) / 100;
    const lngPadding = (lngDiff * paddingPercent) / 100;

    return {
      ne: {
        lat: bounds.ne.lat + latPadding,
        lng: bounds.ne.lng + lngPadding,
      },
      sw: {
        lat: bounds.sw.lat - latPadding,
        lng: bounds.sw.lng - lngPadding,
      },
    };
  }

  /**
   * Get zoom level for bounds
   * @param bounds Map bounds
   * @param mapWidth Map width in pixels
   * @param mapHeight Map height in pixels
   * @returns Suggested zoom level
   */
  public getZoomForBounds(
    bounds: { ne: Location; sw: Location },
    mapWidth: number = 400,
    mapHeight: number = 300
  ): number {
    const latDiff = bounds.ne.lat - bounds.sw.lat;
    const lngDiff = bounds.ne.lng - bounds.sw.lng;

    const maxDiff = Math.max(latDiff, lngDiff);

    // Approximate zoom level based on bounds
    if (maxDiff < 0.01) return 18;
    if (maxDiff < 0.05) return 16;
    if (maxDiff < 0.1) return 15;
    if (maxDiff < 0.5) return 12;
    if (maxDiff < 1) return 11;
    if (maxDiff < 5) return 9;
    if (maxDiff < 10) return 8;
    return 5;
  }

  /**
   * Create a marker icon URL
   * @param color Color of the marker (hex or named color)
   * @param label Single character to display on marker
   * @returns Marker icon URL
   */
  public createMarkerIconUrl(color: string = 'FF0000', label: string = ''): string {
    if (!label) {
      return `http://maps.google.com/mapfiles/ms/icons/${color.toLowerCase()}-dot.png`;
    }
    return `https://chart.googleapis.com/chart?chst=d_map_spin&chld=1|0|${color}|11|${label}`;
  }

  /**
   * Format location for display
   * @param location Location object
   * @returns Formatted string (e.g., "4.6571° N, 74.0995° W")
   */
  public formatLocation(location: Location): string {
    const latDir = location.lat >= 0 ? 'N' : 'S';
    const lngDir = location.lng >= 0 ? 'E' : 'W';
    return `${Math.abs(location.lat).toFixed(4)}° ${latDir}, ${Math.abs(location.lng).toFixed(4)}° ${lngDir}`;
  }
}

// Singleton instance
export const googleMapsService = new GoogleMapsService();

export default googleMapsService;
