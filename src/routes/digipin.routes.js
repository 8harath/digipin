const express = require('express');
const router = express.Router();
const { getDigiPin, getLatLngFromDigiPin } = require('../digipin');
const {
  encodeValidation,
  decodeValidation,
  batchEncodeValidation,
  batchDecodeValidation,
  distanceValidation,
  neighborsValidation,
  handleValidationErrors
} = require('../middleware/validation');
const {
  haversineDistance,
  getNeighbors,
  getBoundingBox,
  formatDigipin,
  getGridSeparation
} = require('../utils/helpers');
const { PRECISION_INFO } = require('../utils/constants');
const { batchLimiter } = require('../middleware/rateLimiter');
const logger = require('../config/logger');

// Encode endpoint (GET)
router.get('/encode', encodeValidation, handleValidationErrors, (req, res) => {
  const { latitude, longitude, precision } = req.query;
  try {
    const prec = precision ? parseInt(precision) : 10;
    const code = getDigiPin(parseFloat(latitude), parseFloat(longitude), prec);
    const formatted = prec === 10 ? code : code;

    res.json({
      digipin: formatted,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      precision: prec,
      precisionInfo: PRECISION_INFO[prec]
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Encode endpoint (POST)
router.post('/encode', encodeValidation, handleValidationErrors, (req, res) => {
  const { latitude, longitude, precision } = req.body;
  try {
    const prec = precision || 10;
    const code = getDigiPin(latitude, longitude, prec);
    const formatted = prec === 10 ? code : code;

    res.json({
      digipin: formatted,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      precision: prec,
      precisionInfo: PRECISION_INFO[prec]
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Decode endpoint (GET)
router.get('/decode', decodeValidation, handleValidationErrors, (req, res) => {
  const { digipin, returnBounds } = req.query;
  try {
    const coords = getLatLngFromDigiPin(digipin);
    const response = { ...coords };

    if (returnBounds === 'true') {
      response.bounds = getBoundingBox(digipin);
    }

    const pin = digipin.replace(/-/g, '');
    response.precision = pin.length;
    response.precisionInfo = PRECISION_INFO[pin.length];

    res.json(response);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Decode endpoint (POST)
router.post('/decode', decodeValidation, handleValidationErrors, (req, res) => {
  const { digipin, returnBounds } = req.body;
  try {
    const coords = getLatLngFromDigiPin(digipin);
    const response = { ...coords };

    if (returnBounds) {
      response.bounds = getBoundingBox(digipin);
    }

    const pin = digipin.replace(/-/g, '');
    response.precision = pin.length;
    response.precisionInfo = PRECISION_INFO[pin.length];

    res.json(response);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Batch encode endpoint (with stricter rate limiting)
router.post('/batch/encode', batchLimiter, batchEncodeValidation, handleValidationErrors, (req, res) => {
  const { locations, precision } = req.body;
  try {
    const prec = precision || 10;
    const results = locations.map((loc, index) => {
      try {
        const code = getDigiPin(loc.latitude, loc.longitude, prec);
        return {
          index,
          success: true,
          digipin: code,
          coordinates: {
            latitude: loc.latitude,
            longitude: loc.longitude
          }
        };
      } catch (error) {
        return {
          index,
          success: false,
          error: error.message,
          coordinates: {
            latitude: loc.latitude,
            longitude: loc.longitude
          }
        };
      }
    });

    const successCount = results.filter(r => r.success).length;
    res.json({
      total: locations.length,
      successful: successCount,
      failed: locations.length - successCount,
      precision: prec,
      results
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Batch decode endpoint (with stricter rate limiting)
router.post('/batch/decode', batchLimiter, batchDecodeValidation, handleValidationErrors, (req, res) => {
  const { digipins, returnBounds } = req.body;
  try {
    const results = digipins.map((digipin, index) => {
      try {
        const coords = getLatLngFromDigiPin(digipin);
        const result = {
          index,
          success: true,
          digipin,
          ...coords
        };

        if (returnBounds) {
          result.bounds = getBoundingBox(digipin);
        }

        return result;
      } catch (error) {
        return {
          index,
          success: false,
          digipin,
          error: error.message
        };
      }
    });

    const successCount = results.filter(r => r.success).length;
    res.json({
      total: digipins.length,
      successful: successCount,
      failed: digipins.length - successCount,
      results
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Distance calculation endpoint
router.get('/distance', distanceValidation, handleValidationErrors, (req, res) => {
  const { from, to, unit = 'km' } = req.query;
  try {
    const coords1 = getLatLngFromDigiPin(from);
    const coords2 = getLatLngFromDigiPin(to);

    const distance = haversineDistance(
      parseFloat(coords1.latitude),
      parseFloat(coords1.longitude),
      parseFloat(coords2.latitude),
      parseFloat(coords2.longitude),
      unit
    );

    const gridSeparation = getGridSeparation(from, to);

    res.json({
      from: {
        digipin: from,
        coordinates: coords1
      },
      to: {
        digipin: to,
        coordinates: coords2
      },
      distance: parseFloat(distance.toFixed(2)),
      unit: unit === 'm' ? 'meters' : unit === 'mi' ? 'miles' : 'kilometers',
      gridLevelDivergence: gridSeparation,
      estimatedTravelTime: {
        walking: `${Math.round((distance / (unit === 'm' ? 83.33 : unit === 'mi' ? 0.05175 : 5)) * 60)} minutes`,
        driving: `${Math.round((distance / (unit === 'm' ? 833.33 : unit === 'mi' ? 0.5175 : 50)) * 60)} minutes`
      }
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Neighbors endpoint
router.get('/neighbors', neighborsValidation, handleValidationErrors, (req, res) => {
  const { digipin, distance = 1 } = req.query;
  try {
    if (parseInt(distance) !== 1) {
      return res.status(400).json({
        error: 'Only distance=1 is currently supported for neighbors'
      });
    }

    const neighbors = getNeighbors(digipin, getLatLngFromDigiPin, getDigiPin);
    const centerCoords = getLatLngFromDigiPin(digipin);

    res.json({
      center: {
        digipin,
        coordinates: centerCoords
      },
      neighbors
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;