const { body, query, validationResult } = require('express-validator');
const { BOUNDS } = require('../utils/constants');

/**
 * Validation middleware for DIGIPIN API endpoints
 */

// Validation rules for encoding coordinates
const encodeValidation = [
  query('latitude')
    .optional({ checkFalsy: false })
    .isFloat({ min: BOUNDS.minLat, max: BOUNDS.maxLat })
    .withMessage(`Latitude must be between ${BOUNDS.minLat} and ${BOUNDS.maxLat}`),
  query('longitude')
    .optional({ checkFalsy: false })
    .isFloat({ min: BOUNDS.minLon, max: BOUNDS.maxLon })
    .withMessage(`Longitude must be between ${BOUNDS.minLon} and ${BOUNDS.maxLon}`),
  query('precision')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Precision must be between 1 and 10'),
  body('latitude')
    .optional({ checkFalsy: false })
    .isFloat({ min: BOUNDS.minLat, max: BOUNDS.maxLat })
    .withMessage(`Latitude must be between ${BOUNDS.minLat} and ${BOUNDS.maxLat}`),
  body('longitude')
    .optional({ checkFalsy: false })
    .isFloat({ min: BOUNDS.minLon, max: BOUNDS.maxLon })
    .withMessage(`Longitude must be between ${BOUNDS.minLon} and ${BOUNDS.maxLon}`),
  body('precision')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Precision must be between 1 and 10')
];

// Validation rules for decoding DIGIPIN
const decodeValidation = [
  query('digipin')
    .optional()
    .matches(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$|^[2-9CFJKLMPT]{1,10}$/)
    .withMessage('Invalid DIGIPIN format. Expected format: XXX-XXX-XXXX or partial code'),
  query('returnBounds')
    .optional()
    .isBoolean()
    .withMessage('returnBounds must be a boolean'),
  body('digipin')
    .optional()
    .matches(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$|^[2-9CFJKLMPT]{1,10}$/)
    .withMessage('Invalid DIGIPIN format. Expected format: XXX-XXX-XXXX or partial code'),
  body('returnBounds')
    .optional()
    .isBoolean()
    .withMessage('returnBounds must be a boolean')
];

// Validation rules for batch encoding
const batchEncodeValidation = [
  body('locations')
    .isArray({ min: 1, max: 1000 })
    .withMessage('Locations must be an array with 1-1000 items'),
  body('locations.*.latitude')
    .isFloat({ min: BOUNDS.minLat, max: BOUNDS.maxLat })
    .withMessage(`Latitude must be between ${BOUNDS.minLat} and ${BOUNDS.maxLat}`),
  body('locations.*.longitude')
    .isFloat({ min: BOUNDS.minLon, max: BOUNDS.maxLon })
    .withMessage(`Longitude must be between ${BOUNDS.minLon} and ${BOUNDS.maxLon}`),
  body('precision')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Precision must be between 1 and 10')
];

// Validation rules for batch decoding
const batchDecodeValidation = [
  body('digipins')
    .isArray({ min: 1, max: 1000 })
    .withMessage('Digipins must be an array with 1-1000 items'),
  body('digipins.*')
    .matches(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$|^[2-9CFJKLMPT]{1,10}$/)
    .withMessage('Invalid DIGIPIN format'),
  body('returnBounds')
    .optional()
    .isBoolean()
    .withMessage('returnBounds must be a boolean')
];

// Validation rules for distance calculation
const distanceValidation = [
  query('from')
    .notEmpty()
    .matches(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$|^[2-9CFJKLMPT]{1,10}$/)
    .withMessage('Invalid from DIGIPIN format'),
  query('to')
    .notEmpty()
    .matches(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$|^[2-9CFJKLMPT]{1,10}$/)
    .withMessage('Invalid to DIGIPIN format'),
  query('unit')
    .optional()
    .isIn(['m', 'km', 'mi'])
    .withMessage('Unit must be m, km, or mi')
];

// Validation rules for neighbors
const neighborsValidation = [
  query('digipin')
    .notEmpty()
    .matches(/^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$|^[2-9CFJKLMPT]{1,10}$/)
    .withMessage('Invalid DIGIPIN format'),
  query('distance')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Distance must be between 1 and 10')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  encodeValidation,
  decodeValidation,
  batchEncodeValidation,
  batchDecodeValidation,
  distanceValidation,
  neighborsValidation,
  handleValidationErrors
};
