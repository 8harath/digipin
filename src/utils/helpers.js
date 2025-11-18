const { DIGIPIN_GRID, BOUNDS, NEIGHBOR_DIRECTIONS } = require('./constants');

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @param {string} unit - Unit of measurement ('m', 'km', 'mi')
 * @returns {number} Distance in specified unit
 */
function haversineDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  const R = unit === 'mi' ? 3958.8 : 6371; // Earth radius in km or miles
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return unit === 'm' ? distance * 1000 : distance;
}

/**
 * Get grid position for a character in DIGIPIN_GRID
 * @param {string} char - DIGIPIN character
 * @returns {object} { row, col } or null if not found
 */
function getGridPosition(char) {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (DIGIPIN_GRID[row][col] === char) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * Get neighboring DIGIPIN codes
 * @param {string} digipin - Base DIGIPIN code
 * @param {function} getLatLngFromDigiPin - Decode function
 * @param {function} getDigiPin - Encode function
 * @returns {object} Neighbors in all 8 directions
 */
function getNeighbors(digipin, getLatLngFromDigiPin, getDigiPin) {
  try {
    const pin = digipin.replace(/-/g, '');
    const precision = pin.length;

    // Decode to get center coordinates
    const coords = getLatLngFromDigiPin(digipin);
    const lat = parseFloat(coords.latitude);
    const lon = parseFloat(coords.longitude);

    // Calculate the cell size at this precision level
    const latRange = BOUNDS.maxLat - BOUNDS.minLat;
    const lonRange = BOUNDS.maxLon - BOUNDS.minLon;
    const cellSizeLat = latRange / Math.pow(4, precision);
    const cellSizeLon = lonRange / Math.pow(4, precision);

    const neighbors = {};

    // Calculate neighbors in all 8 directions
    for (const [direction, vector] of Object.entries(NEIGHBOR_DIRECTIONS)) {
      try {
        const neighborLat = lat + vector.row * cellSizeLat;
        const neighborLon = lon + vector.col * cellSizeLon;

        // Check if neighbor is within bounds
        if (
          neighborLat >= BOUNDS.minLat &&
          neighborLat <= BOUNDS.maxLat &&
          neighborLon >= BOUNDS.minLon &&
          neighborLon <= BOUNDS.maxLon
        ) {
          const neighborDigipin = getDigiPin(neighborLat, neighborLon);
          neighbors[direction] = {
            digipin: neighborDigipin,
            direction: vector.name,
            coordinates: {
              latitude: neighborLat.toFixed(6),
              longitude: neighborLon.toFixed(6)
            }
          };
        } else {
          neighbors[direction] = null; // Out of bounds
        }
      } catch (error) {
        neighbors[direction] = null; // Error calculating neighbor
      }
    }

    return neighbors;
  } catch (error) {
    throw new Error('Failed to calculate neighbors: ' + error.message);
  }
}

/**
 * Get bounding box for a DIGIPIN code
 * @param {string} digipin - DIGIPIN code (can be partial)
 * @returns {object} Bounding box coordinates
 */
function getBoundingBox(digipin) {
  const pin = digipin.replace(/-/g, '');
  if (pin.length < 1 || pin.length > 10) {
    throw new Error('Invalid DIGIPIN length');
  }

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  for (let i = 0; i < pin.length; i++) {
    const char = pin[i];
    let found = false;
    let ri = -1,
      ci = -1;

    // Locate character in DIGIPIN grid
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (DIGIPIN_GRID[r][c] === char) {
          ri = r;
          ci = c;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) throw new Error('Invalid character in DIGIPIN');

    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    const lat1 = maxLat - latDiv * (ri + 1);
    const lat2 = maxLat - latDiv * ri;
    const lon1 = minLon + lonDiv * ci;
    const lon2 = minLon + lonDiv * (ci + 1);

    // Update bounding box for next level
    minLat = lat1;
    maxLat = lat2;
    minLon = lon1;
    maxLon = lon2;
  }

  return {
    north: parseFloat(maxLat.toFixed(6)),
    south: parseFloat(minLat.toFixed(6)),
    east: parseFloat(maxLon.toFixed(6)),
    west: parseFloat(minLon.toFixed(6)),
    center: {
      latitude: parseFloat(((minLat + maxLat) / 2).toFixed(6)),
      longitude: parseFloat(((minLon + maxLon) / 2).toFixed(6))
    }
  };
}

/**
 * Format DIGIPIN with dashes
 * @param {string} digipin - Raw DIGIPIN code
 * @returns {string} Formatted DIGIPIN
 */
function formatDigipin(digipin) {
  const pin = digipin.replace(/-/g, '');
  if (pin.length === 10) {
    return `${pin.slice(0, 3)}-${pin.slice(3, 6)}-${pin.slice(6)}`;
  }
  return pin;
}

/**
 * Calculate grid cell separation between two DIGIPINs
 * @param {string} digipin1 - First DIGIPIN
 * @param {string} digipin2 - Second DIGIPIN
 * @returns {number} Number of grid cells separating the DIGIPINs
 */
function getGridSeparation(digipin1, digipin2) {
  const pin1 = digipin1.replace(/-/g, '');
  const pin2 = digipin2.replace(/-/g, '');

  // Find the first differing character
  let level = 0;
  for (let i = 0; i < Math.min(pin1.length, pin2.length); i++) {
    if (pin1[i] !== pin2[i]) {
      break;
    }
    level++;
  }

  return level;
}

module.exports = {
  haversineDistance,
  getGridPosition,
  getNeighbors,
  getBoundingBox,
  formatDigipin,
  getGridSeparation
};
