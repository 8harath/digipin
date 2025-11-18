/**
 * DIGIPIN Encoder and Decoder Library
 * Developed by India Post, Department of Posts
 * Released under an open-source license for public use
 *
 * This module contains two main functions:
 *  - getDigiPin(lat, lon, precision): Encodes latitude & longitude into a DIGIPIN
 *  - getLatLngFromDigiPin(digiPin): Decodes a DIGIPIN back into its central latitude & longitude
 */

const { DIGIPIN_GRID, BOUNDS } = require('./utils/constants');

  function getDigiPin(lat, lon, precision = 10) {
    if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat) throw new Error('Latitude out of range');
    if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon) throw new Error('Longitude out of range');
    if (precision < 1 || precision > 10) throw new Error('Precision must be between 1 and 10');

    let minLat = BOUNDS.minLat;
    let maxLat = BOUNDS.maxLat;
    let minLon = BOUNDS.minLon;
    let maxLon = BOUNDS.maxLon;

    let digiPin = '';

    for (let level = 1; level <= precision; level++) {
      const latDiv = (maxLat - minLat) / 4;
      const lonDiv = (maxLon - minLon) / 4;

      // REVERSED row logic (to match original)
      let row = 3 - Math.floor((lat - minLat) / latDiv);
      let col = Math.floor((lon - minLon) / lonDiv);

      row = Math.max(0, Math.min(row, 3));
      col = Math.max(0, Math.min(col, 3));

      digiPin += DIGIPIN_GRID[row][col];

      if (precision === 10 && (level === 3 || level === 6)) digiPin += '-';

      // Update bounds (reverse logic for row)
      maxLat = minLat + latDiv * (4 - row);
      minLat = minLat + latDiv * (3 - row);

      minLon = minLon + lonDiv * col;
      maxLon = minLon + lonDiv;
    }

    return digiPin;
  }
  
  
  function getLatLngFromDigiPin(digiPin) {
    const pin = digiPin.replace(/-/g, '');
    if (pin.length < 1 || pin.length > 10) throw new Error('Invalid DIGIPIN');

    let minLat = BOUNDS.minLat;
    let maxLat = BOUNDS.maxLat;
    let minLon = BOUNDS.minLon;
    let maxLon = BOUNDS.maxLon;

    for (let i = 0; i < pin.length; i++) {
      const char = pin[i];
      let found = false;
      let ri = -1, ci = -1;
  
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
  
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
  
    return {
      latitude: centerLat.toFixed(6),
      longitude: centerLon.toFixed(6)
    };
  }
  
  
  if (typeof module !== 'undefined') module.exports = { getDigiPin, getLatLngFromDigiPin };