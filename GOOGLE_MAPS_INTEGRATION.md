# Google Maps Integration for Incident Management

## Overview

The frontend has been enhanced with comprehensive Google Maps support for visualizing incident locations, calculating distances, and managing geographic data. This integration provides an interactive, feature-rich mapping experience across multiple pages of the incident management system.

## Architecture

### Core Components

#### 1. **GoogleMapsService** (Data Layer)
**File**: `src/data/repositories/google-maps-service.ts`

A singleton service providing utility methods for geographic calculations and map operations:

```typescript
// Distance calculations (Haversine formula)
calculateDistance(origin: Location, destination: Location): number

// Route distance for multiple waypoints
calculateRouteDistance(route: Location[]): number

// Center point calculation
getCenterLocation(locations: Location[]): Location

// Bounds management
getBounds(locations: Location[]): { ne: Location; sw: Location }
padBounds(bounds, paddingPercent): bounds

// Display formatting
formatDistance(meters: number): string // "5.5 km" or "350 m"
formatLocation(location: Location): string // "4.6097° N, 74.0817° W"

// Map generation URLs
getStaticMapUrl(center, markers, zoom, size): string
getDirectionsUrl(origin, destination, travelMode): string

// Zoom level calculation
getZoomForBounds(bounds, mapWidth, mapHeight): number

// Marker icon generation
createMarkerIconUrl(color: string, label: string): string

// Bounds validation
isWithinBounds(location: Location, bounds): boolean
```

#### 2. **GoogleMap Component** (Presentation Layer)
**File**: `src/presentation/components/GoogleMap.tsx`

Interactive React component with the following features:

```typescript
interface GoogleMapProps {
  initialCenter?: { lat: number; lng: number }; // Map center (default: Bogotá)
  markers?: Marker[]; // Array of markers to display
  onMarkerSelected?: (marker: Marker) => void; // Callback when marker clicked
  onLocationSelected?: (location: Location) => void; // Callback when map clicked
  onMarkersChanged?: (markers: Marker[]) => void; // Callback when markers change
  height?: string; // Container height (default: "500px")
  zoom?: number; // Initial zoom level (default: 13)
  showSearchBar?: boolean; // Show location search (default: true)
  readOnly?: boolean; // Disable editing (default: false)
  showDistance?: boolean; // Show total distance (default: true)
}
```

**Features**:
- Interactive marker placement by clicking on map
- Location search with geocoding
- Marker management (add, delete, clear)
- Distance calculation between waypoints
- Marker selection with info windows
- Auto-fit bounds for multiple markers
- Color-coded markers by status
- Navigation links to Google Maps
- Responsive design with Tailwind CSS
- Error handling and loading states
- Toast notifications for user feedback

#### 3. **useGoogleMap Hook** (Custom Hook)
**File**: `src/application/hooks/useGoogleMap.ts`

Convenience hook for managing markers and calculations:

```typescript
const {
  // State
  markers,
  selectedMarker,

  // Marker management
  addMarker,
  addMarkers,
  updateMarker,
  removeMarker,
  clearMarkers,
  getMarkerById,
  selectMarker,
  deselectMarker,

  // Distance calculations
  getDistanceBetween,
  getTotalDistance,
  getFormattedTotalDistance,

  // Location calculations
  getCenterLocation,
  getBounds,
  getAppropriateZoom,

  // Navigation
  getDirectionsUrl,

  // Utilities
  isWithinBounds,
  formatLocation,
  createMarkerIconUrl,
} = useGoogleMap();
```

## Integration Points

### 1. Incident Detail Page
**File**: `src/presentation/pages/IncidenteDetallesPage.tsx`

Displays a single incident's location on a read-only map:

```tsx
<GoogleMap
  initialCenter={{
    lat: incident.ubicacion.latitud,
    lng: incident.ubicacion.longitud,
  }}
  markers={[
    {
      id: `incident_${incident.id}`,
      lat: incident.ubicacion.latitud,
      lng: incident.ubicacion.longitud,
      label: 'Incidente',
      color: 'FF0000',
      info: incident.ubicacion.descripcionTextual,
    },
  ]}
  readOnly={true}
  showSearchBar={false}
  showDistance={false}
  height="500px"
  zoom={15}
/>
```

### 2. Reception Center Page
**File**: `src/presentation/pages/RecepcionPage.tsx`

Features:
- **Dual View Mode**: Toggle between table and map visualization
- **Real-time Updates**: WebSocket integration for live incident markers
- **Status-based Colors**:
  - Gold (FFD700): RECIBIDO
  - Green (00FF00): APROBADO
  - Red (FF0000): RECHAZADO
  - Blue (0000FF): Other states
- **Marker Info**: Truncated incident descriptions on hover

```tsx
// Toggle buttons in header
<button onClick={() => setViewMode('table')}>Tabla</button>
<button onClick={() => setViewMode('map')}>Mapa</button>

// Conditional rendering
{viewMode === 'table' ? (
  <IncidentsTable {...props} />
) : (
  <GoogleMap markers={incidentMarkers} {...props} />
)}
```

### 3. Incidents List Page
**File**: `src/presentation/pages/IncidentesListPage.tsx`

Features:
- **Map View**: Visualize all filtered incidents on a map
- **Filter Integration**: Map respects applied filters
- **Same Color Scheme**: Status-based marker colors
- **Pagination Support**: Map shows current page's incidents

```tsx
// View toggle integrated with filter panel
// Map view works with all existing filters
```

## Environment Configuration

### Required Variables

```bash
# In .env file
REACT_APP_GOOGLE_API_KEY=your_google_maps_api_key_here
```

### API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Static Maps API (optional)
4. Create a web API key
5. Add your domain to authorized origins
6. Add the key to `.env` file

## Usage Examples

### Basic Map with Single Marker

```tsx
import { GoogleMap } from './components/GoogleMap';

export function MyComponent() {
  return (
    <GoogleMap
      initialCenter={{ lat: 4.6097, lng: -74.0817 }}
      markers={[
        {
          id: 'marker_1',
          lat: 4.6097,
          lng: -74.0817,
          label: 'Incident',
          color: 'FF0000',
          info: 'Emergency location',
        },
      ]}
      readOnly={true}
      height="500px"
    />
  );
}
```

### Interactive Map with useGoogleMap Hook

```tsx
import useGoogleMap from './hooks/useGoogleMap';
import { GoogleMap } from './components/GoogleMap';

export function InteractiveMapComponent() {
  const { markers, addMarker, getTotalDistance, getFormattedTotalDistance } = useGoogleMap();

  const handleLocationSelected = (location) => {
    addMarker({
      id: `marker_${Date.now()}`,
      lat: location.lat,
      lng: location.lng,
      label: `Point ${markers.length + 1}`,
    });
  };

  return (
    <div>
      <GoogleMap
        markers={markers}
        onLocationSelected={handleLocationSelected}
        showDistance={true}
        height="600px"
      />
      <p>Total Distance: {getFormattedTotalDistance()}</p>
    </div>
  );
}
```

### Distance Calculations

```tsx
import useGoogleMap from './hooks/useGoogleMap';

function DistanceCalculator() {
  const { markers, getDistanceBetween, getTotalDistance } = useGoogleMap();

  if (markers.length >= 2) {
    const distance = getDistanceBetween(markers[0].id, markers[1].id);
    return <p>Distance: {(distance / 1000).toFixed(2)} km</p>;
  }

  return null;
}
```

### Directions

```tsx
import useGoogleMap from './hooks/useGoogleMap';

function DirectionsButton() {
  const { markers, getDirectionsUrl } = useGoogleMap();

  if (markers.length >= 2) {
    const url = getDirectionsUrl(
      markers[0].id,
      markers[1].id,
      'DRIVING'
    );

    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        Get Directions
      </a>
    );
  }

  return null;
}
```

## Marker Colors Reference

```typescript
// Common colors for markers
const markerColors = {
  received: 'FFD700',      // Gold
  approved: '00FF00',      // Green
  rejected: 'FF0000',      // Red
  analysis: '0000FF',      // Blue
  pending: 'FF7F50',       // Coral
  emergency: 'FF0000',     // Red
};
```

## Real-time Updates (WebSocket Integration)

The maps automatically update when incidents are created or modified via WebSocket events:

```tsx
// In pages using WebSocket
const { onIncidentCreated, onIncidentUpdated } = useIncidentWebSocket();

useEffect(() => {
  const unsub = onIncidentCreated((incident) => {
    // Map automatically updates through state
    // if incident has ubicacion with coordinates
  });

  return () => unsub();
}, [onIncidentCreated]);
```

## Performance Considerations

### Marker Rendering
- **Efficient Updates**: Only markers with valid coordinates are rendered
- **Lazy Loading**: Map tiles load as user pans/zooms
- **Event Debouncing**: Marker updates are batched

### Calculations
- **Haversine Formula**: Accurate distance calculations without API calls
- **Caching**: Bounds and zoom calculations are memoized
- **Filtered Rendering**: Only visible markers are processed

### Best Practices

1. **Limit Markers**: For performance, keep marker count under 500
2. **Cluster Large Sets**: Consider implementing marker clustering for 100+ markers
3. **Clean Up**: Always unsubscribe from WebSocket events
4. **Memoize Markers**: Use `useMemo` to prevent unnecessary recalculations

## Troubleshooting

### Map Not Loading
- Verify `REACT_APP_GOOGLE_API_KEY` is set in `.env`
- Check Google Maps API is enabled in Cloud Console
- Verify domain is in authorized origins

### Markers Not Appearing
- Ensure incident has valid `ubicacion.latitud` and `ubicacion.longitud`
- Check console for errors in `onMarkerSelected` callback
- Verify marker ID is unique

### Slow Performance
- Check number of markers being rendered
- Consider filtering incidents before displaying on map
- Use `readOnly={true}` mode when editing not needed

### Coordinates Not Accurate
- Verify coordinates are in lat/lng format (not lng/lat)
- Check for coordinate precision (6 decimal places recommended)
- Use `googleMapsService.formatLocation()` for display

## Future Enhancements

- [ ] Marker clustering for large datasets
- [ ] Heat maps for incident density
- [ ] Route optimization algorithms
- [ ] Polygon/radius drawing tools
- [ ] Real-time vehicle tracking
- [ ] Custom marker icons per incident type
- [ ] Map export/sharing functionality
- [ ] 3D terrain visualization
- [ ] Offline map caching
- [ ] Custom map styling

## Testing

### Unit Tests Example

```typescript
import { googleMapsService } from './google-maps-service';

describe('GoogleMapsService', () => {
  it('should calculate distance correctly', () => {
    const origin = { lat: 4.6097, lng: -74.0817 };
    const destination = { lat: 4.7111, lng: -74.0075 };
    const distance = googleMapsService.calculateDistance(origin, destination);
    expect(distance).toBeGreaterThan(0);
  });

  it('should format distance correctly', () => {
    expect(googleMapsService.formatDistance(5500)).toBe('5.50 km');
    expect(googleMapsService.formatDistance(350)).toBe('350 m');
  });
});
```

## Support

For issues or questions about the Google Maps integration:
1. Check browser console for JavaScript errors
2. Verify API key permissions in Google Cloud Console
3. Review the component props in `GoogleMapProps` interface
4. Check incident data structure includes required `ubicacion` fields
5. Test with the browser DevTools Network tab to monitor API calls
