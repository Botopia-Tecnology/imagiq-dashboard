# 🗺️ Coverage Zones API Integration Guide

## 📋 Overview

This document describes the frontend implementation for the Coverage Zones feature, designed to integrate with a microservices backend using GeoJSON format and PostGIS.

---

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Maps**: Leaflet + React Leaflet
- **Data Format**: GeoJSON (RFC 7946)
- **Backend**: Microservices architecture (ready to integrate)
- **Database**: PostGIS (recommended for backend)

### Components Structure

```
src/
├── types/coverage-zones.ts          # TypeScript interfaces
├── lib/
│   ├── api/coverage-zones.ts        # HTTP client (fetch-based)
│   └── utils/geojson.ts             # Leaflet ↔ GeoJSON transformers
├── hooks/
│   └── use-coverage-zones.ts        # React hooks for state management
├── components/coverage-zones/
│   ├── map-viewer.tsx               # Interactive map component
│   └── city-selector.tsx            # City dropdown selector
└── app/(dashboard)/zonas-cobertura/
    └── page.tsx                     # Main page with online/offline mode
```

---

## 🔌 Backend Integration

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

For production:

```bash
NEXT_PUBLIC_API_URL=https://api.imagiq.com/api
```

### Required Endpoints

The frontend expects these endpoints from the backend:

#### 1. Get Zones by City

```http
GET /api/coverage-zones?cityId={cityId}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-here",
      "cityId": "bogota",
      "name": "Zona Norte",
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-74.0921, 4.7310],
            [-74.0621, 4.7510],
            [-74.0421, 4.7410],
            [-74.0621, 4.7210],
            [-74.0921, 4.7310]
          ]
        ]
      },
      "properties": {
        "color": "#3b82f6",
        "isActive": true,
        "deliveryFee": 5000,
        "estimatedTime": "30-45 min"
      },
      "createdAt": "2025-10-21T12:00:00Z",
      "updatedAt": "2025-10-21T12:00:00Z"
    }
  ],
  "message": "Zones retrieved successfully",
  "timestamp": "2025-10-21T12:00:00Z"
}
```

#### 2. Create Zone

```http
POST /api/coverage-zones
Content-Type: application/json

{
  "cityId": "bogota",
  "name": "Zona Norte",
  "geometry": {
    "type": "Polygon",
    "coordinates": [...]
  },
  "properties": {
    "color": "#3b82f6",
    "isActive": true,
    "deliveryFee": 5000,
    "estimatedTime": "30-45 min"
  }
}
```

**Response:** Same as GET (single zone)

#### 3. Update Zone

```http
PATCH /api/coverage-zones/{id}
Content-Type: application/json

{
  "name": "Zona Norte Actualizada",
  "properties": {
    "color": "#ff0000",
    "isActive": false
  }
}
```

#### 4. Delete Zone

```http
DELETE /api/coverage-zones/{id}
```

**Response:**
```json
{
  "data": null,
  "message": "Zone deleted successfully",
  "timestamp": "2025-10-21T12:00:00Z"
}
```

#### 5. Check Coverage (Point-in-Polygon)

```http
POST /api/coverage-zones/check
Content-Type: application/json

{
  "point": {
    "lat": 4.7110,
    "lng": -74.0721
  },
  "cityId": "bogota"
}
```

**Response:**
```json
{
  "data": {
    "covered": true,
    "zone": {
      "id": "uuid-here",
      "name": "Zona Norte",
      "deliveryFee": 5000,
      "estimatedTime": "30-45 min"
    }
  },
  "message": "Coverage checked successfully",
  "timestamp": "2025-10-21T12:00:00Z"
}
```

---

## 📊 GeoJSON Format Specification

### Coordinate Order

**IMPORTANT**: GeoJSON uses `[longitude, latitude]` order (opposite of Leaflet's `[latitude, longitude]`).

### Polygon Example

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [-74.0921, 4.7310],  // [lng, lat]
      [-74.0621, 4.7510],
      [-74.0421, 4.7410],
      [-74.0621, 4.7210],
      [-74.0921, 4.7310]   // Closing point (same as first)
    ]
  ]
}
```

### Circle (Point with Radius)

```json
{
  "type": "Point",
  "coordinates": [-74.0721, 4.7110]
}
// Note: radius stored in properties.radius (meters)
```

---

## 🔧 Backend Implementation (PostGIS)

### Database Schema

```sql
CREATE TABLE coverage_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  geometry GEOMETRY(Geometry, 4326) NOT NULL,  -- SRID 4326 = WGS84
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  delivery_fee DECIMAL(10,2),
  estimated_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Spatial index for performance
CREATE INDEX idx_coverage_zones_geometry
ON coverage_zones USING GIST(geometry);

-- Index for city filtering
CREATE INDEX idx_coverage_zones_city
ON coverage_zones(city_id) WHERE is_active = true;
```

### Point-in-Polygon Query Example

```sql
SELECT
  id, name, delivery_fee, estimated_time
FROM coverage_zones
WHERE city_id = $1
  AND is_active = true
  AND ST_Contains(geometry, ST_SetSRID(ST_Point($2, $3), 4326))
LIMIT 1;

-- $1 = cityId
-- $2 = longitude
-- $3 = latitude
```

---

## 🚀 Usage in Frontend

### Basic Usage

```tsx
import { useCoverageZones } from "@/hooks/use-coverage-zones"

function MyComponent() {
  const {
    zones,
    isLoading,
    error,
    createZone,
    updateZone,
    deleteZone,
  } = useCoverageZones({
    cityId: "bogota",
    autoFetch: true,
  })

  // Create a zone
  const handleCreate = async () => {
    const newZone = { /* ... */ }
    await createZone(newZone)
  }

  // Update a zone
  const handleUpdate = async (id: string) => {
    await updateZone(id, { name: "New Name" })
  }

  // Delete a zone
  const handleDelete = async (id: string) => {
    await deleteZone(id)
  }

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {zones.map(zone => (
        <div key={zone.id}>{zone.name}</div>
      ))}
    </div>
  )
}
```

### Coverage Check

```tsx
import { useCoverageCheck } from "@/hooks/use-coverage-zones"

function AddressChecker() {
  const { checkCoverage, isChecking } = useCoverageCheck({
    cityId: "bogota"
  })

  const handleCheck = async () => {
    const result = await checkCoverage(4.7110, -74.0721)

    if (result?.covered) {
      console.log(`Covered by: ${result.zone?.name}`)
      console.log(`Delivery fee: ${result.zone?.deliveryFee}`)
    } else {
      console.log("Not covered")
    }
  }

  return <button onClick={handleCheck}>Check Coverage</button>
}
```

---

## 🔄 Offline Mode

The frontend automatically falls back to mock data if the backend is unavailable:

- **Online Mode**: All CRUD operations go to the backend
- **Offline Mode**: Data is stored in component state (not persisted)
- **Auto-Detection**: Switches to offline if network error detected

Indicator in UI:
- 🟢 "Conectado" badge when online
- 🔴 "Modo Offline" badge when offline

---

## 🧪 Testing the Integration

### 1. Without Backend (Offline Mode)

The app works immediately with mock data. No backend required for development.

### 2. With Backend

1. Set `NEXT_PUBLIC_API_URL` in `.env.local`
2. Ensure backend implements the endpoints above
3. Start the backend server
4. Refresh the frontend - it will auto-connect

### 3. Testing Point-in-Polygon

Use the coverage check endpoint to validate that zones work correctly:

```bash
curl -X POST http://localhost:3001/api/coverage-zones/check \
  -H "Content-Type: application/json" \
  -d '{
    "point": { "lat": 4.7110, "lng": -74.0721 },
    "cityId": "bogota"
  }'
```

---

## 📚 Additional Resources

- **GeoJSON Specification**: https://datatracker.ietf.org/doc/html/rfc7946
- **PostGIS Documentation**: https://postgis.net/documentation/
- **Leaflet API**: https://leafletjs.com/reference.html
- **React Leaflet**: https://react-leaflet.js.org/

---

## 🐛 Troubleshooting

### Issue: "Network Error" immediately

- **Cause**: Backend not running or `NEXT_PUBLIC_API_URL` incorrect
- **Solution**: Check `.env.local` and verify backend is running

### Issue: Zones not appearing on map

- **Cause**: Invalid GeoJSON coordinates
- **Solution**: Ensure coordinates are in `[longitude, latitude]` order

### Issue: Point-in-Polygon not working

- **Cause**: SRID mismatch or invalid polygon
- **Solution**: Use SRID 4326 and ensure polygons are closed (first point = last point)

---

## 📞 Support

For questions about the frontend implementation, contact the development team.
For backend microservices integration, refer to your backend documentation.
