/**
 * Constants for DIGIPIN API
 */

const DIGIPIN_GRID = [
  ['F', 'C', '9', '8'],
  ['J', '3', '2', '7'],
  ['K', '4', '5', '6'],
  ['L', 'M', 'P', 'T']
];

const BOUNDS = {
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5
};

// Grid size information for different precision levels
const PRECISION_INFO = {
  1: { gridSize: '9°', approxDistance: '1000 km' },
  2: { gridSize: '2.25°', approxDistance: '250 km' },
  3: { gridSize: '33.75′', approxDistance: '62.5 km' },
  4: { gridSize: '8.44′', approxDistance: '15.6 km' },
  5: { gridSize: '2.11′', approxDistance: '3.9 km' },
  6: { gridSize: '0.53′', approxDistance: '1 km' },
  7: { gridSize: '0.13′', approxDistance: '250 m' },
  8: { gridSize: '0.03′', approxDistance: '60 m' },
  9: { gridSize: '0.5″', approxDistance: '15 m' },
  10: { gridSize: '0.12″', approxDistance: '3.8 m' }
};

// Direction vectors for neighboring cells
const NEIGHBOR_DIRECTIONS = {
  N: { row: -1, col: 0, name: 'North' },
  NE: { row: -1, col: 1, name: 'Northeast' },
  E: { row: 0, col: 1, name: 'East' },
  SE: { row: 1, col: 1, name: 'Southeast' },
  S: { row: 1, col: 0, name: 'South' },
  SW: { row: 1, col: -1, name: 'Southwest' },
  W: { row: 0, col: -1, name: 'West' },
  NW: { row: -1, col: -1, name: 'Northwest' }
};

module.exports = {
  DIGIPIN_GRID,
  BOUNDS,
  PRECISION_INFO,
  NEIGHBOR_DIRECTIONS
};
