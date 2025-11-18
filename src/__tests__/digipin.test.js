const { getDigiPin, getLatLngFromDigiPin } = require('../digipin');
const { BOUNDS } = require('../utils/constants');

describe('DIGIPIN Encoder (getDigiPin)', () => {
  describe('Valid encoding', () => {
    test('should encode Bengaluru coordinates correctly', () => {
      const digipin = getDigiPin(12.9716, 77.5946);
      expect(digipin).toBeTruthy();
      expect(digipin).toMatch(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$/);
    });

    test('should encode Delhi coordinates correctly', () => {
      const digipin = getDigiPin(28.6139, 77.2090);
      expect(digipin).toBeTruthy();
      expect(digipin).toMatch(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$/);
    });

    test('should encode Mumbai coordinates correctly', () => {
      const digipin = getDigiPin(19.0760, 72.8777);
      expect(digipin).toBeTruthy();
      expect(digipin).toMatch(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$/);
    });
  });

  describe('Precision levels', () => {
    test('should generate partial DIGIPIN with precision 6', () => {
      const digipin = getDigiPin(12.9716, 77.5946, 6);
      expect(digipin.replace(/-/g, '').length).toBe(6);
    });

    test('should generate partial DIGIPIN with precision 3', () => {
      const digipin = getDigiPin(12.9716, 77.5946, 3);
      expect(digipin.replace(/-/g, '').length).toBe(3);
    });

    test('should generate full DIGIPIN with precision 10', () => {
      const digipin = getDigiPin(12.9716, 77.5946, 10);
      expect(digipin.replace(/-/g, '').length).toBe(10);
      expect(digipin).toMatch(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$/);
    });
  });

  describe('Boundary conditions', () => {
    test('should handle minimum boundary coordinates', () => {
      const digipin = getDigiPin(BOUNDS.minLat + 0.1, BOUNDS.minLon + 0.1);
      expect(digipin).toBeTruthy();
    });

    test('should handle maximum boundary coordinates', () => {
      const digipin = getDigiPin(BOUNDS.maxLat - 0.1, BOUNDS.maxLon - 0.1);
      expect(digipin).toBeTruthy();
    });

    test('should throw error for latitude below minimum', () => {
      expect(() => getDigiPin(BOUNDS.minLat - 1, 77.5946)).toThrow('Latitude out of range');
    });

    test('should throw error for latitude above maximum', () => {
      expect(() => getDigiPin(BOUNDS.maxLat + 1, 77.5946)).toThrow('Latitude out of range');
    });

    test('should throw error for longitude below minimum', () => {
      expect(() => getDigiPin(12.9716, BOUNDS.minLon - 1)).toThrow('Longitude out of range');
    });

    test('should throw error for longitude above maximum', () => {
      expect(() => getDigiPin(12.9716, BOUNDS.maxLon + 1)).toThrow('Longitude out of range');
    });
  });

  describe('Invalid inputs', () => {
    test('should throw error for invalid precision (too low)', () => {
      expect(() => getDigiPin(12.9716, 77.5946, 0)).toThrow('Precision must be between 1 and 10');
    });

    test('should throw error for invalid precision (too high)', () => {
      expect(() => getDigiPin(12.9716, 77.5946, 11)).toThrow('Precision must be between 1 and 10');
    });
  });
});

describe('DIGIPIN Decoder (getLatLngFromDigiPin)', () => {
  describe('Valid decoding', () => {
    test('should decode full DIGIPIN correctly', () => {
      const digipin = '4P3-JK8-52C9';
      const coords = getLatLngFromDigiPin(digipin);
      expect(coords).toHaveProperty('latitude');
      expect(coords).toHaveProperty('longitude');
      expect(parseFloat(coords.latitude)).toBeGreaterThanOrEqual(BOUNDS.minLat);
      expect(parseFloat(coords.latitude)).toBeLessThanOrEqual(BOUNDS.maxLat);
      expect(parseFloat(coords.longitude)).toBeGreaterThanOrEqual(BOUNDS.minLon);
      expect(parseFloat(coords.longitude)).toBeLessThanOrEqual(BOUNDS.maxLon);
    });

    test('should decode partial DIGIPIN (6 chars)', () => {
      const digipin = '4P3JK8';
      const coords = getLatLngFromDigiPin(digipin);
      expect(coords).toHaveProperty('latitude');
      expect(coords).toHaveProperty('longitude');
    });

    test('should decode DIGIPIN without dashes', () => {
      const digipin = '4P3JK852C9';
      const coords = getLatLngFromDigiPin(digipin);
      expect(coords).toHaveProperty('latitude');
      expect(coords).toHaveProperty('longitude');
    });
  });

  describe('Round-trip encoding and decoding', () => {
    test('should maintain precision in round-trip', () => {
      const originalLat = 12.9716;
      const originalLon = 77.5946;
      const digipin = getDigiPin(originalLat, originalLon);
      const decoded = getLatLngFromDigiPin(digipin);

      // Should be within ~4 meters (precision of level 10)
      const latDiff = Math.abs(parseFloat(decoded.latitude) - originalLat);
      const lonDiff = Math.abs(parseFloat(decoded.longitude) - originalLon);

      expect(latDiff).toBeLessThan(0.0001); // ~10m
      expect(lonDiff).toBeLessThan(0.0001);
    });

    test('should handle multiple round-trips consistently', () => {
      const lat = 28.6139;
      const lon = 77.2090;
      const digipin1 = getDigiPin(lat, lon);
      const decoded1 = getLatLngFromDigiPin(digipin1);
      const digipin2 = getDigiPin(parseFloat(decoded1.latitude), parseFloat(decoded1.longitude));

      expect(digipin1).toBe(digipin2);
    });
  });

  describe('Invalid inputs', () => {
    test('should throw error for empty DIGIPIN', () => {
      expect(() => getLatLngFromDigiPin('')).toThrow('Invalid DIGIPIN');
    });

    test('should throw error for DIGIPIN too long', () => {
      expect(() => getLatLngFromDigiPin('4P3JK852C9X')).toThrow('Invalid DIGIPIN');
    });

    test('should throw error for invalid characters', () => {
      expect(() => getLatLngFromDigiPin('ABC-DEF-GHIJ')).toThrow('Invalid character in DIGIPIN');
    });

    test('should throw error for DIGIPIN with invalid character "A"', () => {
      expect(() => getLatLngFromDigiPin('A23-456-789T')).toThrow('Invalid character in DIGIPIN');
    });
  });
});

describe('Integration tests', () => {
  describe('Known locations', () => {
    const testLocations = [
      { name: 'Dak Bhawan, Delhi', lat: 28.622788, lon: 77.213033 },
      { name: 'Gateway of India, Mumbai', lat: 18.9220, lon: 72.8347 },
      { name: 'Mysore Palace', lat: 12.3052, lon: 76.6552 }
    ];

    testLocations.forEach(({ name, lat, lon }) => {
      test(`should encode and decode ${name} consistently`, () => {
        const digipin = getDigiPin(lat, lon);
        const decoded = getLatLngFromDigiPin(digipin);

        expect(Math.abs(parseFloat(decoded.latitude) - lat)).toBeLessThan(0.0001);
        expect(Math.abs(parseFloat(decoded.longitude) - lon)).toBeLessThan(0.0001);
      });
    });
  });

  describe('Different precision levels', () => {
    const lat = 19.0760;
    const lon = 72.8777;

    [1, 3, 6, 8, 10].forEach(precision => {
      test(`should work with precision ${precision}`, () => {
        const digipin = getDigiPin(lat, lon, precision);
        expect(digipin.replace(/-/g, '').length).toBe(precision);

        const decoded = getLatLngFromDigiPin(digipin);
        expect(decoded).toHaveProperty('latitude');
        expect(decoded).toHaveProperty('longitude');
      });
    });
  });
});
