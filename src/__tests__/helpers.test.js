const {
  haversineDistance,
  getGridPosition,
  getBoundingBox,
  formatDigipin,
  getGridSeparation
} = require('../utils/helpers');

describe('Helper Functions', () => {
  describe('haversineDistance', () => {
    test('should calculate distance between two points in kilometers', () => {
      const distance = haversineDistance(12.9716, 77.5946, 28.6139, 77.209, 'km');
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(1741, -1); // Approximately 1741 km
    });

    test('should calculate distance in meters', () => {
      const distance = haversineDistance(12.9716, 77.5946, 12.9816, 77.6046, 'm');
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2000); // Less than 2km
    });

    test('should calculate distance in miles', () => {
      const distance = haversineDistance(12.9716, 77.5946, 28.6139, 77.209, 'mi');
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeCloseTo(1082, -1); // Approximately 1082 miles
    });

    test('should return 0 for same coordinates', () => {
      const distance = haversineDistance(12.9716, 77.5946, 12.9716, 77.5946, 'km');
      expect(distance).toBeCloseTo(0, 5);
    });
  });

  describe('getGridPosition', () => {
    test('should find position of valid character', () => {
      const pos = getGridPosition('F');
      expect(pos).toEqual({ row: 0, col: 0 });
    });

    test('should find position of number character', () => {
      const pos = getGridPosition('2');
      expect(pos).toHaveProperty('row');
      expect(pos).toHaveProperty('col');
    });

    test('should return null for invalid character', () => {
      const pos = getGridPosition('A');
      expect(pos).toBeNull();
    });

    test('should return null for empty string', () => {
      const pos = getGridPosition('');
      expect(pos).toBeNull();
    });
  });

  describe('getBoundingBox', () => {
    test('should get bounding box for full DIGIPIN', () => {
      const bounds = getBoundingBox('4P3-JK8-52C9');
      expect(bounds).toHaveProperty('north');
      expect(bounds).toHaveProperty('south');
      expect(bounds).toHaveProperty('east');
      expect(bounds).toHaveProperty('west');
      expect(bounds).toHaveProperty('center');
      expect(bounds.north).toBeGreaterThan(bounds.south);
      expect(bounds.east).toBeGreaterThan(bounds.west);
    });

    test('should get bounding box for partial DIGIPIN', () => {
      const bounds = getBoundingBox('4P3');
      expect(bounds).toHaveProperty('north');
      expect(bounds).toHaveProperty('south');
      expect(bounds).toHaveProperty('east');
      expect(bounds).toHaveProperty('west');
      expect(bounds.north - bounds.south).toBeGreaterThan(0.5); // Larger area for partial
    });

    test('should have center within bounds', () => {
      const bounds = getBoundingBox('4P3-JK8-52C9');
      expect(bounds.center.latitude).toBeGreaterThanOrEqual(bounds.south);
      expect(bounds.center.latitude).toBeLessThanOrEqual(bounds.north);
      expect(bounds.center.longitude).toBeGreaterThanOrEqual(bounds.west);
      expect(bounds.center.longitude).toBeLessThanOrEqual(bounds.east);
    });

    test('should throw error for invalid DIGIPIN', () => {
      expect(() => getBoundingBox('INVALID')).toThrow();
    });
  });

  describe('formatDigipin', () => {
    test('should format 10-character DIGIPIN with dashes', () => {
      const formatted = formatDigipin('4P3JK852C9');
      expect(formatted).toBe('4P3-JK8-52C9');
    });

    test('should not add dashes to partial DIGIPIN', () => {
      const formatted = formatDigipin('4P3JK8');
      expect(formatted).toBe('4P3JK8');
    });

    test('should remove existing dashes and reformat', () => {
      const formatted = formatDigipin('4P3-JK8-52C9');
      expect(formatted).toBe('4P3-JK8-52C9');
    });

    test('should handle empty string', () => {
      const formatted = formatDigipin('');
      expect(formatted).toBe('');
    });
  });

  describe('getGridSeparation', () => {
    test('should return 0 for identical DIGIPINs', () => {
      const separation = getGridSeparation('4P3-JK8-52C9', '4P3-JK8-52C9');
      expect(separation).toBe(10);
    });

    test('should return correct separation for different DIGIPINs', () => {
      const separation = getGridSeparation('4P3-JK8-52C9', '4P3-JK8-52C8');
      expect(separation).toBeGreaterThanOrEqual(0);
      expect(separation).toBeLessThanOrEqual(10);
    });

    test('should find first divergence point', () => {
      const separation = getGridSeparation('4P3JK8', '4P9JK8');
      expect(separation).toBeLessThan(6);
    });
  });
});
