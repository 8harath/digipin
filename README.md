# DIGIPIN API by Department of Posts

<div align="center" style="display: flex; justify-content: center; align-items: center; gap: 20px;">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Ministry_of_Communications_India.svg/1920px-Ministry_of_Communications_India.svg.png" alt="Ministry of Communications" width="240"/>
  <img src="https://dev.cept.gov.in/mydigipin/_next/image?url=%2Fmydigipin%2Fimages%2Findiapost_logo_v2.webp&w=1920&q=75" alt="India Post" width="120"/>
</div>

## A Geospatial Addressing Solution by India Post

DIGIPIN (Digital PIN) is a 10-character alphanumeric geocode developed by the Department of Posts, India. It provides a precise, user-friendly way to encode geographic coordinates that can be easily shared and decoded back to latitude/longitude pairs.

This open-source Node.js project exposes a public API to generate and decode DIGIPINs, supporting geolocation services, postal logistics, and spatial analysis applications.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.x-blue.svg)](https://expressjs.com/)

---

## 🏛️ About DIGIPIN

The Department of Posts has undertaken an initiative to establish a Digital Public Infrastructure (DPI) for a standardized, geo-coded addressing system in India. DIGIPIN represents the foundation layer of this infrastructure.

Developed in collaboration with IIT Hyderabad and NRSC (National Remote Sensing Centre, ISRO), DIGIPIN is an open-source national-level addressing grid that serves as a key component of India's digital address ecosystem.

After extensive public consultation and expert review, the DIGIPIN Grid has been finalized to provide simplified addressing solutions for seamless delivery of public and private services, enabling "Address as a Service" (AaaS) across the country.

### Key Highlights

- **Uniform Referencing Framework**: Provides logical, precise location identification both offline and online
- **GIS Integration**: Bridges the gap between physical and digital addresses
- **Cross-Sector Support**: Enhances service delivery across emergency response, e-commerce, logistics, BFSI, and governance
- **Policy Alignment**: Complies with the National Geospatial Policy 2022, enriching India's geospatial knowledge stack

DIGIPIN simplifies address management and enhances service delivery accuracy, promoting a thriving geospatial ecosystem for India's digital economy.

---

## ✨ Features

### Core Functionality
- **Encode**: Convert latitude and longitude into DIGIPIN codes (1-10 character precision)
- **Decode**: Transform DIGIPIN back to coordinates with optional bounding boxes
- **Precision Levels**: Support for 10 different precision levels (1000km to 3.8m)

### Advanced Features
- **Batch Processing**: Encode/decode up to 1000 locations in a single request
- **Distance Calculation**: Haversine distance between DIGIPINs with travel time estimates
- **Neighboring Cells**: Find all 8 adjacent DIGIPIN cells
- **Area Bounding Box**: Get geographic bounds for any DIGIPIN

### Production-Ready
- **Comprehensive Testing**: 90%+ code coverage with Jest
- **Rate Limiting**: Configurable rate limits per endpoint (1000/hour standard, 100/hour batch)
- **Input Validation**: Robust validation with express-validator
- **Structured Logging**: Winston-based logging with error tracking
- **Docker Support**: Multi-stage Dockerfile with docker-compose setup
- **Interactive Documentation**: Swagger UI for API exploration
- **Health Checks**: Built-in health check endpoint
- **Error Handling**: Standardized error responses

### Developer Experience
- **RESTful API**: Clean, standard-compliant endpoints
- **TypeScript-Ready**: Clear interfaces and type definitions
- **Lightweight**: Optimized for performance and minimal resource usage
- **Extensible**: Modular architecture for easy feature additions

---

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Getting Started

1. **Clone the Repository**

```bash
git clone https://github.com/CEPT-VZG/digipin.git
cd digipin
```

2. **Install Dependencies**

```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the project root with the following variables:

```
PORT=5000
NODE_ENV=development
```

4. **Start the Server**

```bash
npm start
```

For development with hot reloading:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## 🚀 API Usage

### Core Endpoints

#### 1. Encode Coordinates to DIGIPIN

```bash
GET /api/digipin/encode?latitude=12.9716&longitude=77.5946&precision=10
```

**Response:**
```json
{
  "digipin": "4P3-JK8-52C9",
  "coordinates": { "latitude": 12.9716, "longitude": 77.5946 },
  "precision": 10,
  "precisionInfo": { "gridSize": "0.12″", "approxDistance": "3.8 m" }
}
```

#### 2. Decode DIGIPIN to Coordinates

```bash
GET /api/digipin/decode?digipin=4P3-JK8-52C9
```

**Response:**
```json
{
  "latitude": "12.971588",
  "longitude": "77.594589",
  "precision": 10,
  "precisionInfo": { "gridSize": "0.12″", "approxDistance": "3.8 m" }
}
```

### Advanced Features

#### 3. Batch Processing

Encode/decode up to 1000 locations in a single request:

```bash
POST /api/digipin/batch/encode
Content-Type: application/json

{
  "locations": [
    { "latitude": 12.9716, "longitude": 77.5946 },
    { "latitude": 28.6139, "longitude": 77.2090 }
  ]
}
```

#### 4. Distance Calculation

Calculate distance between two DIGIPINs with travel time estimates:

```bash
GET /api/digipin/distance?from=4P3-JK8-52C9&to=39J-49L-L8T4&unit=km
```

**Response:**
```json
{
  "distance": 1741.23,
  "unit": "kilometers",
  "estimatedTravelTime": {
    "walking": "20895 minutes",
    "driving": "2089 minutes"
  }
}
```

#### 5. Neighboring Cells

Find all 8 adjacent DIGIPIN cells:

```bash
GET /api/digipin/neighbors?digipin=4P3-JK8-52C9
```

Returns neighbors in all directions (N, NE, E, SE, S, SW, W, NW).

#### 6. Precision Levels

Support for partial DIGIPINs (1-10 characters) for varying area sizes:
- **Precision 6**: ~1 km area (locality level)
- **Precision 8**: ~60 m area (building cluster)
- **Precision 10**: ~3.8 m area (precise location)

### Interactive Documentation

Visit `http://localhost:5000/api-docs` for full Swagger UI documentation.

Detailed API docs: [docs/API.md](docs/API.md)

---

## 🧪 Testing

Comprehensive test suite with 90%+ code coverage:

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm run test:unit
npm run test:api
```

---

## 🐳 Docker Support

### Using Docker

```bash
# Build and run with Docker
docker build -t digipin-api .
docker run -p 5000:5000 digipin-api
```

### Using Docker Compose

```bash
# Start all services (API + Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The Docker setup includes:
- Multi-stage build for optimized image size
- Non-root user for security
- Health checks
- Redis for caching (optional)
- Persistent log volumes

---

## 🔒 Production Features

### Rate Limiting
- **Standard endpoints**: 1000 requests/hour
- **Batch endpoints**: 100 requests/hour
- Configurable limits per endpoint

### Structured Logging
- Winston-based logging system
- Separate error and combined logs
- Request/response tracking
- HTTP request logging with duration

### Input Validation
- Comprehensive request validation
- Coordinate range verification
- DIGIPIN format validation
- Automatic error responses

### Error Handling
- Standardized error responses
- Development vs production modes
- Stack traces in development
- Graceful degradation

---

## 📊 Performance

- Sub-100ms response times for single operations
- Batch processing for up to 1000 items
- Optimized encoding/decoding algorithms
- Minimal memory footprint

---

## 🔧 Contributing

We welcome contributions! Check out [CONTRIBUTION_IDEAS.md](CONTRIBUTION_IDEAS.md) for feature suggestions and implementation priorities.

### Getting Started

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Maintain test coverage above 80%
- Follow existing code style
- Add documentation for new features
- Update API docs when adding endpoints

---

## 📜 License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Department of Posts, Government of India
- Indian Institute of Technology, Hyderabad
- National Remote Sensing Centre, ISRO

---

*Transforming addresses for Digital India*
