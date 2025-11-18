# DIGIPIN API Documentation

## Base URL
```
http://localhost:5000/api/digipin
```

## Rate Limiting
- **Standard endpoints**: 1000 requests per hour
- **Batch endpoints**: 100 requests per hour
- Rate limit headers are included in responses

---

## Endpoints

### 1. Encode Coordinates to DIGIPIN

#### GET `/encode`
Converts latitude and longitude to a DIGIPIN code.

**Query Parameters:**
- `latitude` (required): Latitude (2.5 to 38.5)
- `longitude` (required): Longitude (63.5 to 99.5)
- `precision` (optional): Precision level 1-10 (default: 10)

**Example Request:**
```bash
GET /api/digipin/encode?latitude=12.9716&longitude=77.5946&precision=10
```

**Example Response:**
```json
{
  "digipin": "4P3-JK8-52C9",
  "coordinates": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "precision": 10,
  "precisionInfo": {
    "gridSize": "0.12″",
    "approxDistance": "3.8 m"
  }
}
```

---

#### POST `/encode`
Same as GET but accepts body parameters.

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "precision": 6
}
```

**Response:**
```json
{
  "digipin": "39J49L",
  "coordinates": {
    "latitude": 28.6139,
    "longitude": 77.209
  },
  "precision": 6,
  "precisionInfo": {
    "gridSize": "0.53′",
    "approxDistance": "1 km"
  }
}
```

---

### 2. Decode DIGIPIN to Coordinates

#### GET `/decode`
Converts a DIGIPIN code back to coordinates.

**Query Parameters:**
- `digipin` (required): DIGIPIN code (full or partial)
- `returnBounds` (optional): Return bounding box (true/false)

**Example Request:**
```bash
GET /api/digipin/decode?digipin=4P3-JK8-52C9&returnBounds=true
```

**Example Response:**
```json
{
  "latitude": "12.971588",
  "longitude": "77.594589",
  "precision": 10,
  "precisionInfo": {
    "gridSize": "0.12″",
    "approxDistance": "3.8 m"
  },
  "bounds": {
    "north": 12.971592,
    "south": 12.971584,
    "east": 77.594593,
    "west": 77.594585,
    "center": {
      "latitude": 12.971588,
      "longitude": 77.594589
    }
  }
}
```

---

#### POST `/decode`
Same as GET but accepts body parameters.

**Request Body:**
```json
{
  "digipin": "39J49L",
  "returnBounds": true
}
```

---

### 3. Batch Encode

#### POST `/batch/encode`
Encode multiple locations in a single request (max 1000).

**Request Body:**
```json
{
  "locations": [
    { "latitude": 12.9716, "longitude": 77.5946 },
    { "latitude": 28.6139, "longitude": 77.2090 },
    { "latitude": 19.0760, "longitude": 72.8777 }
  ],
  "precision": 10
}
```

**Response:**
```json
{
  "total": 3,
  "successful": 3,
  "failed": 0,
  "precision": 10,
  "results": [
    {
      "index": 0,
      "success": true,
      "digipin": "4P3-JK8-52C9",
      "coordinates": {
        "latitude": 12.9716,
        "longitude": 77.5946
      }
    },
    {
      "index": 1,
      "success": true,
      "digipin": "39J-49L-L8T4",
      "coordinates": {
        "latitude": 28.6139,
        "longitude": 77.2090
      }
    },
    {
      "index": 2,
      "success": true,
      "digipin": "KP6-3K7-9FP5",
      "coordinates": {
        "latitude": 19.0760,
        "longitude": 72.8777
      }
    }
  ]
}
```

---

### 4. Batch Decode

#### POST `/batch/decode`
Decode multiple DIGIPINs in a single request (max 1000).

**Request Body:**
```json
{
  "digipins": ["4P3-JK8-52C9", "39J-49L-L8T4", "KP6-3K7-9FP5"],
  "returnBounds": false
}
```

**Response:**
```json
{
  "total": 3,
  "successful": 3,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "success": true,
      "digipin": "4P3-JK8-52C9",
      "latitude": "12.971588",
      "longitude": "77.594589"
    },
    {
      "index": 1,
      "success": true,
      "digipin": "39J-49L-L8T4",
      "latitude": "28.622788",
      "longitude": "77.213033"
    },
    {
      "index": 2,
      "success": true,
      "digipin": "KP6-3K7-9FP5",
      "latitude": "19.075993",
      "longitude": "72.877752"
    }
  ]
}
```

---

### 5. Calculate Distance

#### GET `/distance`
Calculate the distance between two DIGIPIN codes.

**Query Parameters:**
- `from` (required): Source DIGIPIN
- `to` (required): Destination DIGIPIN
- `unit` (optional): Distance unit (km, m, mi) - default: km

**Example Request:**
```bash
GET /api/digipin/distance?from=4P3-JK8-52C9&to=39J-49L-L8T4&unit=km
```

**Example Response:**
```json
{
  "from": {
    "digipin": "4P3-JK8-52C9",
    "coordinates": {
      "latitude": "12.971588",
      "longitude": "77.594589"
    }
  },
  "to": {
    "digipin": "39J-49L-L8T4",
    "coordinates": {
      "latitude": "28.622788",
      "longitude": "77.213033"
    }
  },
  "distance": 1741.23,
  "unit": "kilometers",
  "gridLevelDivergence": 0,
  "estimatedTravelTime": {
    "walking": "20895 minutes",
    "driving": "2089 minutes"
  }
}
```

---

### 6. Get Neighboring Cells

#### GET `/neighbors`
Get all 8 neighboring DIGIPIN cells (N, NE, E, SE, S, SW, W, NW).

**Query Parameters:**
- `digipin` (required): Center DIGIPIN code
- `distance` (optional): Distance in grid cells (only 1 supported currently)

**Example Request:**
```bash
GET /api/digipin/neighbors?digipin=4P3-JK8-52C9
```

**Example Response:**
```json
{
  "center": {
    "digipin": "4P3-JK8-52C9",
    "coordinates": {
      "latitude": "12.971588",
      "longitude": "77.594589"
    }
  },
  "neighbors": {
    "N": {
      "digipin": "4P3-JK8-52C8",
      "direction": "North",
      "coordinates": {
        "latitude": "12.971596",
        "longitude": "77.594589"
      }
    },
    "NE": {
      "digipin": "4P3-JK8-52C7",
      "direction": "Northeast",
      "coordinates": {
        "latitude": "12.971596",
        "longitude": "77.594597"
      }
    },
    "E": {
      "digipin": "4P3-JK8-5267",
      "direction": "East",
      "coordinates": {
        "latitude": "12.971588",
        "longitude": "77.594597"
      }
    },
    "SE": {
      "digipin": "4P3-JK8-5266",
      "direction": "Southeast",
      "coordinates": {
        "latitude": "12.971580",
        "longitude": "77.594597"
      }
    },
    "S": {
      "digipin": "4P3-JK8-5265",
      "direction": "South",
      "coordinates": {
        "latitude": "12.971580",
        "longitude": "77.594589"
      }
    },
    "SW": {
      "digipin": "4P3-JK8-5264",
      "direction": "Southwest",
      "coordinates": {
        "latitude": "12.971580",
        "longitude": "77.594581"
      }
    },
    "W": {
      "digipin": "4P3-JK8-52C4",
      "direction": "West",
      "coordinates": {
        "latitude": "12.971588",
        "longitude": "77.594581"
      }
    },
    "NW": {
      "digipin": "4P3-JK8-52C3",
      "direction": "Northwest",
      "coordinates": {
        "latitude": "12.971596",
        "longitude": "77.594581"
      }
    }
  }
}
```

---

## Error Responses

All endpoints return standard error responses:

**400 Bad Request:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Latitude must be between 2.5 and 38.5",
      "param": "latitude",
      "location": "query"
    }
  ]
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests from this IP, please try again later.",
  "retryAfter": "1 hour",
  "limit": 1000,
  "windowMs": 3600000
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error"
}
```

---

## Precision Levels

| Precision | Grid Size | Approx Distance | Use Case |
|-----------|-----------|-----------------|----------|
| 1 | 9° | 1000 km | Country/Region level |
| 2 | 2.25° | 250 km | State level |
| 3 | 33.75′ | 62.5 km | District level |
| 4 | 8.44′ | 15.6 km | City level |
| 5 | 2.11′ | 3.9 km | Neighborhood |
| 6 | 0.53′ | 1 km | Locality |
| 7 | 0.13′ | 250 m | Street level |
| 8 | 0.03′ | 60 m | Building cluster |
| 9 | 0.5″ | 15 m | Building |
| 10 | 0.12″ | 3.8 m | Precise location |

---

## Health Check

#### GET `/health`
Check API status (no rate limiting).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T17:30:00.000Z",
  "uptime": 3600.5
}
```

---

## Response Headers

All API responses include:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Time when rate limit resets (Unix timestamp)

---

## Best Practices

1. **Batch Operations**: Use batch endpoints when processing multiple locations
2. **Precision Levels**: Choose appropriate precision for your use case to reduce data size
3. **Caching**: Cache decoded coordinates on client side when possible
4. **Error Handling**: Always handle rate limit errors with exponential backoff
5. **Validation**: Validate coordinates before sending requests

---

## Example Use Cases

### 1. Delivery Address Encoding
```bash
# Encode delivery address
POST /api/digipin/encode
{
  "latitude": 12.9716,
  "longitude": 77.5946
}

# Store DIGIPIN with order: "4P3-JK8-52C9"
```

### 2. Finding Nearby Delivery Points
```bash
# Get neighboring cells for alternate delivery
GET /api/digipin/neighbors?digipin=4P3-JK8-52C9
```

### 3. Route Distance Calculation
```bash
# Calculate distance between pickup and delivery
GET /api/digipin/distance?from=4P3-JK8-52C9&to=39J-49L-L8T4&unit=km
```

### 4. Bulk Location Import
```bash
# Import 1000 locations at once
POST /api/digipin/batch/encode
{
  "locations": [...1000 locations...],
  "precision": 10
}
```

---

For interactive API documentation, visit: `http://localhost:5000/api-docs`
